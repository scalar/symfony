# Release checklist

## Before the first official release

- Review the local commits and migration guide.
- Confirm Scalar repository maintainers and the contributor's maintenance role.
- Confirm ownership of the `scalar/symfony` Packagist entry and its GitHub webhook.
- Confirm the community package's migration/deprecation notice with its maintainer.
- Run the test matrix, fresh installation checks, no-dev smoke check, and browser checks.
- Review the Composer archive: include source, configuration, templates, README, changelog, and license; exclude development dependencies and test files.
- Choose the release version on the `0.2.x` line and write release notes.
- After approval, push commits and tag the release. Verify Composer can install the published version.
- Add the official Symfony integration page and link it from Scalar's integration list only after the package is installable.

Repository permissions, Packagist setup, publishing, and official website updates are external release steps. Local commits do not complete them.

## Client updates

Both PHP integrations should use the same tested Scalar client version. When updating it:

1. Change the explicit CDN version in Symfony's definition and tests, and Laravel's config and fallback.
2. Update README examples and migration/release notes where needed.
3. Run browser checks against the new CDN asset, including document switching and Test Request.
4. Test custom themes and self-hosting. Recompute any documented SRI values.
5. Keep application-provided CDN overrides working.

Dependabot maintains Composer, npm test dependencies, and GitHub Actions. The CDN URL is a PHP configuration value and needs the coordinated update above.

## Deferred features

A Flex recipe can automate configuration and route imports; it is not needed just to register the bundle. A fluent document registrar, automatic CSP/SRI support, and a shared PHP core can be considered independently. They are not required for the current configuration-based integration.
