<?php

declare(strict_types=1);

namespace Scalar\Symfony\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Scalar\Symfony\Controller\ScalarController;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

final class ScalarControllerTest extends TestCase
{
    public function testAttributeAccessRequiresAnAuthorizationChecker(): void
    {
        $controller = new ScalarController(
            ['access_control' => ['mode' => 'attribute', 'attribute' => 'ROLE_API_DOCS']],
            new Environment(new ArrayLoader()),
        );

        $this->expectException(\LogicException::class);
        $this->expectExceptionMessage('The "attribute" access control mode requires symfony/security-core');
        $controller();
    }
}
