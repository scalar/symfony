#!/usr/bin/env bash
set -euo pipefail

package_dir="$(cd "$(dirname "$0")/../.." && pwd)"
app_dir="$(mktemp -d)/app"
trap 'rm -rf "$(dirname "$app_dir")"' EXIT

# Exercise the consumer's real Flex installation, including Composer auto-scripts.
composer create-project symfony/skeleton "$app_dir" "${SYMFONY_SKELETON_VERSION:-^8.0}" --no-interaction --no-progress
cd "$app_dir"
composer config repositories.scalar path "$package_dir"
composer require 'scalar/symfony:@dev' --no-interaction --no-progress

cp "$package_dir/tests/Fixtures/openapi.json" openapi.json
sed \
    -e '/^        # darkMode:/s/^        # /        /' \
    -e '/^        # metaData:/,/^$/s/^        # /        /' \
    -e '/^        # pluginUrls:/,/^$/s/^        # /        /' \
    "$package_dir/docs/configuration.yaml" > config/packages/scalar_symfony.yaml
printf "\n    file: '%%kernel.project_dir%%/openapi.json'\n" >> config/packages/scalar_symfony.yaml
cat > config/routes/scalar_symfony.yaml <<'YAML'
scalar_symfony:
    resource: '@ScalarSymfonyBundle/config/routes.php'
YAML

composer install --no-dev --no-interaction --no-progress
php bin/console cache:clear --env=prod
php bin/console debug:router scalar_symfony_reference --env=prod
php <<'PHP'
<?php
require 'vendor/autoload.php';
(new Symfony\Component\Dotenv\Dotenv())->bootEnv('.env');
$kernel = new App\Kernel('prod', false);
$response = $kernel->handle(Symfony\Component\HttpFoundation\Request::create('/scalar'));
$html = (string) $response->getContent();
if (200 !== $response->getStatusCode() || !str_contains($html, 'Fixture API')) {
    throw new RuntimeException('Fresh Flex installation did not render the embedded document.');
}
if (1 !== preg_match("/Scalar\.createApiReference\('#scalar-api-reference', (\{.*\})\)/s", $html, $matches)) {
    throw new RuntimeException('Fresh Flex installation did not render the Scalar configuration.');
}
$configuration = json_decode($matches[1], true, 512, JSON_THROW_ON_ERROR);
if (true !== ($configuration['darkMode'] ?? null)
    || 'My API' !== ($configuration['metaData']['title'] ?? null)
    || ['/plugins/reference.mjs'] !== ($configuration['pluginUrls'] ?? null)
) {
    throw new RuntimeException('Fresh Flex installation did not render the uncommented YAML examples.');
}
$kernel->shutdown();
echo "Fresh Flex installation passed.\n";
PHP
