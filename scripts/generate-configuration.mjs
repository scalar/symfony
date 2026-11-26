import { writeFileSync } from 'node:fs';
import { apiReferenceConfigurationSchema, apiReferenceConfigurationWithSourceSchema } from '@scalar/schemas/api-reference';
import { stringify } from 'yaml';
import { examples, symfonyNotes } from './configuration-examples.mjs';

const documentKeys = new Set(['_integration', 'content', 'default', 'file', 'sources', 'spec', 'url']);
const activeConfiguration = { theme: 'symfony' };
// Quote date-like strings and other ambiguous scalars for Symfony's YAML parser.
const yamlStyle = { indent: 4, lineWidth: 0, schema: 'yaml-1.1' };

// Undefined means this branch has no YAML example that can be passed as JSON.
function schemaExample(schema, resolving = new Set()) {
    switch (schema.type) {
        case 'optional':
        case 'evaluate':
            return schemaExample(schema.schema, resolving);
        case 'union':
            for (const part of schema.schemas) {
                const example = schemaExample(part, resolving);
                if (example !== undefined) {
                    return example;
                }
            }
            return;
        case 'array':
            if (schemaExample(schema.items, resolving) !== undefined) {
                return [];
            }
            return;
        case 'record': {
            const value = schemaExample(schema.value, resolving);
            if (value !== undefined) {
                const key = schema.key.type === 'number' ? '1' : 'key';
                return { [key]: value };
            }
            return;
        }
        case 'object': {
            const entries = [];
            const optionalEntries = [];
            for (const [key, field] of Object.entries(schema.properties)) {
                const example = schemaExample(field, resolving);
                if (field.type === 'optional') {
                    if (example !== undefined) {
                        optionalEntries.push([key, example]);
                    }
                } else if (example === undefined) {
                    return;
                } else {
                    entries.push([key, example]);
                }
            }
            return Object.fromEntries(entries.length ? entries : optionalEntries.slice(0, 1));
        }
        case 'intersection': {
            const parts = schema.schemas.map((part) => schemaExample(part, resolving));
            if (parts.every((part) => part !== null && typeof part === 'object' && !Array.isArray(part))) {
                return Object.assign({}, ...parts);
            }
            return;
        }
        case 'lazy':
            // Stop walking recursive types once the same factory appears again.
            if (!resolving.has(schema.schema)) {
                return schemaExample(schema.schema(), new Set(resolving).add(schema.schema));
            }
            return null;
        case 'literal':
            return typeof schema.value === 'bigint' ? undefined : schema.value;
        case 'boolean':
            return !(schema.default ?? false);
        case 'number':
            return schema.default ?? 0;
        case 'string':
            return schema.default ?? '';
        case 'nullable':
        case 'any':
        case 'unknown':
            return null;
        case 'function':
        case 'notDefined':
            return;
        default:
            throw new Error(`Unsupported Scalar schema type: ${schema.type}`);
    }
}

function properties(schema) {
    if (schema.type === 'intersection') {
        return Object.assign({}, ...schema.schemas.map(properties));
    }
    if (schema.type === 'object') {
        return schema.properties;
    }
    throw new Error(`Expected a Scalar configuration object, got ${schema.type}`);
}

// Scalar may fill in omitted object fields. Every field we show must survive unchanged.
function preservesExample(actual, example) {
    if (Array.isArray(example)) {
        return Array.isArray(actual) && actual.length === example.length
            && example.every((item, index) => preservesExample(actual[index], item));
    }
    if (example !== null && typeof example === 'object') {
        return actual !== null && typeof actual === 'object' && !Array.isArray(actual)
            && Object.entries(example).every(([key, value]) => Object.hasOwn(actual, key) && preservesExample(actual[key], value));
    }
    return Object.is(actual, example);
}

function wrapDescription(text) {
    const words = text.replace(/`([^`]+)`/g, "'$1'").trim().split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
        if (line.length && line.length + word.length + 1 > 84) {
            lines.push(line);
            line = '';
        }
        line = line ? `${line} ${word}` : word;
    }
    return [...lines, line].filter(Boolean);
}

const header = stringify(
    { scalar_symfony: { url: '/openapi.yaml', configuration: activeConfiguration } },
    yamlStyle,
).trimEnd();
const lines = ['# config/packages/scalar_symfony.yaml', header];

const optionSchemas = properties(apiReferenceConfigurationSchema);
for (const key of Object.keys(optionSchemas).sort()) {
    if (documentKeys.has(key) || Object.hasOwn(activeConfiguration, key)) {
        continue;
    }

    const schema = optionSchemas[key];
    const schemaDescription = schema.typeComment ?? schema.schema?.typeComment;
    if (schemaDescription?.includes('@deprecated')) {
        continue;
    }

    const example = schemaExample(schema);
    if (example === undefined) {
        continue;
    }

    const hasOverride = Object.hasOwn(examples, key);
    const value = hasOverride ? examples[key] : example;
    if (hasOverride && !preservesExample(apiReferenceConfigurationWithSourceSchema({ [key]: value })[key], value)) {
        throw new Error(`Scalar's runtime schema changes the example override for '${key}'. Update scripts/configuration-examples.mjs.`);
    }

    const yamlLines = stringify({ [key]: value }, yamlStyle).replace(/\n$/, '').split('\n');
    lines.push('');
    if (schemaDescription) {
        lines.push(...wrapDescription(schemaDescription).map((line) => `        # ${line}`));
    }
    if (Object.hasOwn(symfonyNotes, key)) {
        lines.push(...wrapDescription(symfonyNotes[key]).map((line) => `        # ${line}`));
    }
    lines.push(...yamlLines.map((line) => `        # ${line}`));
}

writeFileSync(new URL('../docs/configuration.yaml', import.meta.url), lines.join('\n') + '\n');
