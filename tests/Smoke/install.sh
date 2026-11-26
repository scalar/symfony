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
$expected = Symfony\Component\Yaml\Yaml::parseFile('config/packages/scalar_symfony.yaml')['scalar_symfony']['configuration'] ?? [];
$darkMode = $expected['darkMode'] ?? null;
$title = $expected['metaData']['title'] ?? null;
$pluginUrls = $expected['pluginUrls'] ?? null;
if (!is_bool($darkMode) || !is_string($title) || !is_array($pluginUrls) || !array_is_list($pluginUrls)
    || $pluginUrls !== array_filter($pluginUrls, 'is_string')
) {
    throw new RuntimeException('Generated Symfony configuration examples must include a boolean, a metadata title, and a list of plugin URLs.');
}
if ($darkMode !== ($configuration['darkMode'] ?? null)
    || $title !== ($configuration['metaData']['title'] ?? null)
    || $pluginUrls !== ($configuration['pluginUrls'] ?? null)
) {
    throw new RuntimeException('Fresh Flex installation did not render the uncommented YAML examples.');
}
$kernel->shutdown();
echo "Fresh Flex installation passed.\n";
PHP
