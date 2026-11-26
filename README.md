# Scalar for Symfony

[![Latest Version on Packagist](https://img.shields.io/packagist/v/scalar/symfony.svg?style=flat)](https://packagist.org/packages/scalar/symfony)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/scalar/symfony/ci.yml?branch=main&label=tests&style=flat)](https://github.com/scalar/symfony/actions/workflows/ci.yml?query=branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/scalar/symfony/ci.yml?branch=main&label=code%20style&style=flat)](https://github.com/scalar/symfony/actions/workflows/ci.yml?query=branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/scalar/symfony.svg?style=flat)](https://packagist.org/packages/scalar/symfony)

Render an interactive Scalar API reference from your OpenAPI document.

## Documentation

[Read the documentation here](https://scalar.com/products/api-references/integrations/symfony) and browse the [generated YAML configuration reference](docs/configuration.yaml).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## Development checks

Run `npm ci` and `npm run generate:configuration` to regenerate the YAML reference from the locked `@scalar/schemas` package. The weekly Scalar configuration workflow opens a PR when a schema update changes the reference. Approve the workflows on the generated PR to run its checks.

Run `composer test`, `composer analyse`, and `composer lint` before opening a pull request. Use `composer format` to apply PHP-CS-Fixer rules.

CI checks every pull request and pushes to `main`, cancelling superseded runs. It also validates GitHub Actions workflows with actionlint. PHP pushes trigger automatic formatting commits using the same PHP-CS-Fixer configuration.

Mutation testing uses [Infection 0.35.12](https://github.com/infection/infection/releases/tag/0.35.12), installed separately from Composer dependencies, with Xdebug or PCOV enabled. Run `composer test-mutation` with `infection` on your PATH. The check includes uncovered source code and requires at least 97% overall and covered mutation scores; timeouts count as escaped mutations. Reports are written to `var/infection/`.

Published releases copy their notes into `CHANGELOG.md` using the release tag as the version and commit the update to `main`.

GitHub Actions dependencies are recorded in `.github/workflows/actions.lock`. After adding or changing an action, run `gh actions-lock` and commit the workflow changes with the generated lockfile. Install the generator with `gh extension install github/gh-actions-lock --pin v0.4.1`; CI runs `gh actions-lock --verify` alongside actionlint. Docker action images retain their digest pins.


## Credits and license

Created by [Aleksander Frolov](https://github.com/alex-frolov), inspired by [Scalar for Laravel](https://github.com/scalar/laravel). Maintained as part of the [Scalar](https://github.com/scalar) integrations.

MIT. See [LICENSE](LICENSE).
