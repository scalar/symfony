# Scalar for Symfony

Render an interactive Scalar API reference from your OpenAPI document.

Bring a document from a file, URL, inline JSON or YAML, NelmioApiDocBundle, API Platform, or another generator. This package renders the reference; it does not generate or proxy your specification.

## Requirements

- PHP 8.2 or later within PHP 8.x
- Symfony 6.4, 7.2 or later within 7.x, or 8.x
- Symfony FrameworkBundle and TwigBundle (installed as dependencies)

The selected Symfony version may require a newer PHP version. Symfony 8 requires PHP 8.4 or later.

## Installation

```bash
composer require scalar/symfony
```

Symfony Flex enables the bundle automatically. Without Flex, add these bundles to `config/bundles.php` if they are not already enabled:

```php
return [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    Symfony\Bundle\TwigBundle\TwigBundle::class => ['all' => true],
    Scalar\Symfony\ScalarSymfonyBundle::class => ['all' => true],
];
```

Create `config/packages/scalar_symfony.yaml`:

```yaml
scalar_symfony:
    url: '/openapi.yaml'
```

Create `config/routes/scalar_symfony.yaml`:

```yaml
scalar_symfony:
    resource: '@ScalarSymfonyBundle/config/routes.php'
```

Visit `/scalar`. The route is named `scalar_symfony_reference`. The application can boot before a document is configured; requesting the page without one throws `MissingOpenApiDocument` with a clear message.

## Document inputs

Use a URL fetched by the browser:

```yaml
scalar_symfony:
    url: '/openapi.yaml'
```

Or embed a local file, without exposing a separate public document URL:

```yaml
scalar_symfony:
    file: '%kernel.project_dir%/docs/openapi.yaml'
```

Use `%kernel.project_dir%` to avoid relying on the PHP process's working directory. Files are read when the page is requested. A missing, unreadable, or empty file raises an error instead of falling back silently.

Or provide inline JSON or YAML:

```yaml
scalar_symfony:
    content: |
        openapi: 3.1.0
        info:
            title: My API
            version: 1.0.0
        paths: {}
```

For a single document, `file` takes precedence over `content`, which takes precedence over `url`. Empty strings are treated as unset. These inputs belong at the top level, not inside `configuration`.

## Multiple documents

```yaml
scalar_symfony:
    sources:
        - title: API v1
          slug: v1
          url: /openapi/v1.yaml
        - title: API v2
          slug: v2
          file: '%kernel.project_dir%/docs/v2.yaml'
          default: true
```

A non-empty `sources` list overrides the single-document settings. Each source accepts `title`, `slug`, `default`, and the same `file`, `content`, and `url` inputs. Only the selected input is sent to Scalar; server file paths are never included in the client configuration. An empty list falls back to the single-document settings.

## Configuration

```yaml
scalar_symfony:
    path: /scalar
    cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.69.0/dist/browser/standalone.js'
    configuration:
        theme: default
        metaData:
            title: API Reference
            description: Public API documentation
        darkMode: false
        layout: modern
        hideClientButton: true
```

All serializable [Scalar configuration options](https://github.com/scalar/scalar/blob/main/documentation/configuration.md) go under `configuration`, preserving camelCase names. PHP closures and JavaScript callbacks cannot be represented as JSON. Document keys (`url`, `content`, `file`, `sources`) in this map are ignored in favor of the top-level document settings.

Defaults are `theme: default`, `_integration: symfony`, and `metaData.title: API Reference`. Other Scalar options use the client defaults. The package does not set `proxyUrl`; configure it explicitly if your application needs a request proxy. There is no automatic development-environment authorization bypass.

The old `scalar_options` map is a deprecated compatibility alias. For this release it is recursively merged over `configuration`, retaining its previous precedence. Move all values into `configuration` for new code.

The default client version is pinned to 1.69.0, matching the Laravel alignment release. Package updates can change the tested pin. Override `cdn` to use another version or a self-hosted bundle. Laravel retains its existing framework theme, application title, and published UI/proxy defaults; those are intentional framework differences.

Use Symfony route import options to set a host or additional route requirements. Use firewalls and voters for application-specific access policies.

## Access control

The reference page is public by default. To require a security attribute, install and enable Symfony Security:

```bash
composer require symfony/security-bundle
```

```yaml
scalar_symfony:
    file: '%kernel.project_dir%/docs/openapi.yaml'
    access_control:
        mode: attribute
        attribute: ROLE_API_DOCS
```

The attribute is checked through `security.authorization_checker` in every environment. Denied requests receive HTTP 403. Missing attributes or a missing security checker are detected during container compilation. The `public` mode works without Security installed.

This protects the HTML page. A specification fetched from a URL needs its own access rules and browser-compatible authentication/CORS settings. With `file` or `content`, the document is embedded in the protected page and remains available to authorized viewers.

## Self-hosting and template overrides

To self-host the pinned standalone client:

```bash
mkdir -p public/scalar
curl -fLo public/scalar/standalone.js \
  https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.69.0/dist/browser/standalone.js
```

```yaml
scalar_symfony:
    url: /openapi.yaml
    cdn: /scalar/standalone.js
```

Override `templates/bundles/ScalarSymfonyBundle/reference.html.twig` to customize the page. The template receives `cdn`, `configuration`, and script-safe `configurationJson`.

For Subresource Integrity, compute a hash of the exact standalone asset and add `integrity` and `crossorigin="anonymous"` to its script tag. Do not reuse a hash from another version or the CDN's generated package-root response.

For a CSP nonce, generate it per request in your application, make it available to Twig, and add the same nonce to both script tags and your response's CSP header. Do not store a fixed nonce in bundle configuration. The bundle does not manage CSP headers, nonces, or SRI automatically.

## Development

```bash
composer install
composer test
composer analyse
composer lint          # PHP-CS-Fixer, read-only
composer format        # Apply formatting; composer fix also works
bash tests/Smoke/install.sh
```

The installation check creates and removes a temporary Symfony Flex application and runs Composer auto-scripts, production cache warmup, routing, and rendering without dev dependencies. Set `SYMFONY_SKELETON_VERSION='^6.4'` to test the older supported branch.

Browser checks load the pinned CDN client and exercise URL, file, inline, and multiple-document rendering:

```bash
npm ci
npx playwright install chromium
npm run test:browser
```

Node and Playwright are development-only dependencies and are excluded from Composer distribution archives. See [the release checklist](docs/releasing.md) for validation and publication steps.

## Migration and changes

- [Migrate from the community package](docs/migration.md)
- [Changelog](CHANGELOG.md)

## Credits and license

Created by [Aleksander Frolov](https://github.com/alex-frolov), inspired by [Scalar for Laravel](https://github.com/scalar/laravel). Maintained as part of the [Scalar](https://github.com/scalar) integrations.

MIT. See [LICENSE](LICENSE).
