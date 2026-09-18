<?php

declare(strict_types=1);

namespace Scalar\Symfony\Tests\Unit;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Scalar\Symfony\Document;
use Scalar\Symfony\Exception\MissingOpenApiDocument;

final class DocumentTest extends TestCase
{
    public static function documents(): iterable
    {
        yield 'url' => [['url' => '/api.yaml'], ['url' => '/api.yaml']];
        yield 'content overrides url' => [['url' => '/api.yaml', 'content' => '{}'], ['content' => '{}']];
        yield 'empty content falls back' => [['url' => '/api.yaml', 'content' => ''], ['url' => '/api.yaml']];
        yield 'empty file falls back' => [['file' => '', 'content' => '{}'], ['content' => '{}']];
        yield 'metadata' => [['title' => 'API', 'slug' => 'v1', 'default' => true, 'url' => '/v1'], ['title' => 'API', 'slug' => 'v1', 'url' => '/v1', 'default' => true]];
        yield 'false default omitted' => [['default' => false, 'url' => '/v1'], ['url' => '/v1']];
    }

    #[DataProvider('documents')]
    public function testResolution(array $input, array $expected): void
    {
        self::assertSame($expected, Document::resolve($input));
    }

    public function testFileTakesPrecedence(): void
    {
        $source = Document::resolve(['file' => __DIR__.'/../Fixtures/openapi.json', 'content' => 'ignored', 'url' => '/ignored']);
        self::assertSame(['content'], array_keys($source));
        self::assertStringContainsString('Fixture API', $source['content']);
    }

    public function testMissingFileDoesNotSilentlyFallBack(): void
    {
        $this->expectException(MissingOpenApiDocument::class);
        Document::resolve(['file' => __DIR__.'/missing.json', 'url' => '/ignored']);
    }

    public function testEmptyFileIsRejected(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'scalar-empty-');
        try {
            $this->expectException(MissingOpenApiDocument::class);
            Document::resolve(['file' => $file]);
        } finally {
            unlink($file);
        }
    }

    public function testEmptyInputsAreRejected(): void
    {
        $this->expectException(MissingOpenApiDocument::class);
        Document::resolve(['url' => '', 'content' => '', 'file' => '']);
    }
}
