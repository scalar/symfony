<?php

declare(strict_types=1);

use Scalar\Symfony\Tests\Functional\TestKernel;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Request;

require __DIR__.'/../../vendor/autoload.php';

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ('/health' === $path) {
    echo 'ok';

    return;
}
if ('/api/ping' === $path) {
    header('Content-Type: application/json');
    echo '{"status":"ok"}';

    return;
}
if ('/openapi.json' === $path) {
    header('Content-Type: application/json');
    readfile(__DIR__.'/../Fixtures/openapi.json');

    return;
}

$config = match ($_GET['mode'] ?? 'url') {
    'file' => ['file' => __DIR__.'/../Fixtures/openapi.json'],
    'content' => ['content' => file_get_contents(__DIR__.'/../Fixtures/openapi.json')],
    'sources' => ['sources' => [
        ['title' => 'First API', 'url' => '/openapi.json'],
        ['title' => 'Second API', 'content' => '{"openapi":"3.1.0","info":{"title":"Second document","version":"2.0"},"paths":{}}'],
    ]],
    default => ['url' => '/openapi.json'],
};
$kernel = new TestKernel($config + ['configuration' => ['withDefaultFonts' => false, 'telemetry' => false, 'darkMode' => 'dark' === ($_GET['appearance'] ?? 'light'), 'theme' => $_GET['theme'] ?? 'symfony']]);
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
$kernel->shutdown();
(new Filesystem())->remove($kernel->getCacheDir());
