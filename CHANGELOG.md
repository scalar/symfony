# Changelog

## 0.2.0 - 2026-09-18

First official release as `scalar/symfony`, building on Aleksander Frolov's community bundle.

- Add a default Symfony theme based on the official black and white identity, with light and dark modes.
- Adopt the official `scalar/symfony` Composer name and `Scalar\Symfony` PHP namespace. Preserve the existing bundle, route, and configuration names.
- Accept all serializable Scalar options under `configuration`; retain `scalar_options` as a deprecated compatibility alias.
- Add inline content, local files, and multiple documents with explicit precedence and clear missing-document errors.
- Ignore conflicting document keys in the options map.
- Use the unversioned Scalar CDN URL, matching Laravel, and build/serialize configuration once per response.
- Expand regression, browser, production-installation, and compatibility checks.
- Add migration and release guidance and remove stale validation-script instructions.

## 0.1.0

Initial community release by Aleksander Frolov, published as `alex-frolov/scalar-symfony`.
