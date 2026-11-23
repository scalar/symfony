<?php

declare(strict_types=1);

namespace Scalar\Symfony\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Scalar\Symfony\DependencyInjection\ValidateAccessControlPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class ValidateAccessControlPassTest extends TestCase
{
    public function testContainerWithoutBundleConfigurationIsUnchanged(): void
    {
        $container = new ContainerBuilder();
        (new ValidateAccessControlPass())->process($container);

        self::assertSame([], $container->getParameterBag()->all());
    }
}
