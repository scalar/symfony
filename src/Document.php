<?php

declare(strict_types=1);

namespace Scalar\Symfony;

use Scalar\Symfony\Exception\MissingOpenApiDocument;

/**
 * @phpstan-type Input array{url?: string|null, content?: string|null, file?: string|null, title?: string|null, slug?: string|null, default?: bool}
 */
final class Document
{
    /**
     * @param Input $input
     *
     * @return array<string, mixed>
     */
    public static function resolve(array $input): array
    {
        $source = [];
        foreach (['title', 'slug'] as $key) {
            if (isset($input[$key])) {
                $source[$key] = $input[$key];
            }
        }

        $file = $input['file'] ?? null;
        $content = $input['content'] ?? null;
        $url = $input['url'] ?? null;
        if (null !== $file && '' !== $file) {
            if (!is_file($file) || !is_readable($file)) {
                throw new MissingOpenApiDocument(sprintf('The OpenAPI document is not a readable local file: %s', $file));
            }
            $content = @file_get_contents($file);
            if (false === $content || '' === $content) {
                throw new MissingOpenApiDocument(sprintf('The OpenAPI document could not be read or is empty: %s', $file));
            }
        }

        if (null !== $content && '' !== $content) {
            $source['content'] = $content;
        } elseif (null !== $url && '' !== $url) {
            $source['url'] = $url;
        } else {
            throw new MissingOpenApiDocument('A Scalar document needs a url, content, or file.');
        }

        if ($input['default'] ?? false) {
            $source['default'] = true;
        }

        return $source;
    }
}
