<?php

declare(strict_types=1);

namespace Scalar\Symfony\Controller;

use Scalar\Symfony\Document;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Twig\Environment;

final class ScalarController
{
    private const TEMPLATE = '@ScalarSymfony/reference.html.twig';

    /**
     * @param array{
     *     url: string|null,
     *     content: string|null,
     *     file: string|null,
     *     sources: list<array{url?: string|null, content?: string|null, file?: string|null, title?: string|null, slug?: string|null, default?: bool}>,
     *     cdn: string,
     *     path: string,
     *     configuration: array<string, mixed>,
     *     scalar_options: array<string, mixed>,
     *     access_control: array{mode: 'public'|'attribute', attribute: string|null}
     * } $config
     */
    public function __construct(
        private readonly array $config,
        private readonly Environment $twig,
        private readonly ?AuthorizationCheckerInterface $authorizationChecker = null,
    ) {
    }

    public function __invoke(): Response
    {
        $this->authorize();
        $configuration = $this->buildConfiguration();
        $symfonyTheme = 'symfony' === ($configuration['theme'] ?? null);
        if ($symfonyTheme) {
            $configuration['theme'] = 'none';
        }

        return new Response($this->twig->render(self::TEMPLATE, [
            'cdn' => $this->config['cdn'],
            'symfonyTheme' => $symfonyTheme,
            'configuration' => $configuration,
            'configurationJson' => json_encode($configuration, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_THROW_ON_ERROR),
        ]));
    }

    private function authorize(): void
    {
        $accessControl = $this->config['access_control'];

        if ('public' === $accessControl['mode']) {
            return;
        }

        if (null === $this->authorizationChecker) {
            throw new \LogicException('The "attribute" access control mode requires symfony/security-core and a configured security.authorization_checker service (enable Symfony Security).');
        }

        if (false === $this->authorizationChecker->isGranted($accessControl['attribute'])) {
            throw new AccessDeniedHttpException('Access to the API reference is denied.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function buildConfiguration(): array
    {
        /** @var array<string, mixed> $configuration */
        $configuration = array_replace_recursive(
            ['theme' => 'symfony', '_integration' => 'symfony', 'metaData' => ['title' => 'API Reference']],
            $this->config['configuration'],
            $this->config['scalar_options'],
        );
        unset($configuration['url'], $configuration['content'], $configuration['file'], $configuration['sources']);

        if ([] !== $this->config['sources']) {
            $configuration['sources'] = array_map(Document::resolve(...), $this->config['sources']);
        } else {
            $configuration = array_replace($configuration, Document::resolve([
                'url' => $this->config['url'],
                'content' => $this->config['content'],
                'file' => $this->config['file'],
            ]));
        }

        return $configuration;
    }
}
