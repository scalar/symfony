# Migrating from alex-frolov/scalar-symfony

The official Composer package is `scalar/symfony`. The first official release is prepared on the `0.2.x` line. Use a published release once it is available.

Update your application's Composer requirements by removing `alex-frolov/scalar-symfony` and adding `scalar/symfony`, then run Composer update. Do not install both packages together: they use the same bundle/configuration names.

Replace PHP imports and manually registered bundle classes:

```php
// Before
FrolovGuru\ScalarSymfony\ScalarSymfonyBundle::class

// After
Scalar\Symfony\ScalarSymfonyBundle::class
```

With Flex, inspect `config/bundles.php` after changing dependencies and remove any stale community-package registration. Also update controller service overrides and test imports that reference the old PHP namespace.

These names stay unchanged:

| API | Name |
|---|---|
| Bundle | `ScalarSymfonyBundle` |
| Configuration alias | `scalar_symfony` |
| Default path | `/scalar` |
| Route | `scalar_symfony_reference` |
| Route import | `@ScalarSymfonyBundle/config/routes.php` |
| Twig template | `@ScalarSymfony/reference.html.twig` |
| Template override directory | `templates/bundles/ScalarSymfonyBundle/` |

Move `scalar_options` entries into `configuration`. The alias still works and takes precedence if both maps contain the same option, but it is deprecated for new code.

Move document inputs out of either options map into top-level `url`, `content`, `file`, or `sources`. A URL is no longer mandatory if another input is selected. Conflicting document keys in options maps are now ignored. Files and inline documents use `file > content > url`; a non-empty source list overrides all single-document settings.

The default CDN changes from the versioned Scalar 1.65.1 URL to the unversioned `https://cdn.jsdelivr.net/npm/@scalar/api-reference` URL, matching Laravel. It receives client updates independently of Composer releases. An explicit existing `cdn` setting is preserved. If you use SRI, choose an immutable versioned asset and its matching hash.

The public/attribute access modes are unchanged. The package remains public by default. An application with no document configured can now compile its container, but requesting the reference raises `Scalar\Symfony\Exception\MissingOpenApiDocument`.
