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
cat > config/packages/scalar_symfony.yaml <<'YAML'
scalar_symfony:
    file: '%kernel.project_dir%/openapi.json'
YAML
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
if (200 !== $response->getStatusCode() || !str_contains($response->getContent(), 'Fixture API')) {
    throw new RuntimeException('Fresh Flex installation did not render the embedded document.');
}
$kernel->shutdown();
echo "Fresh Flex installation passed.\n";
PHP
