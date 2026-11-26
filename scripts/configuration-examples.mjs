// Use realistic examples for settings that depend on the application.
export const examples = {
    agent: { disabled: true },
    authentication: { preferredSecurityScheme: 'bearerAuth' },
    baseServerURL: 'https://api.example.com',
    customCss: '.scalar-app { --scalar-color-accent: #5b48d6; }',
    defaultHttpClient: { targetKey: 'shell', clientKey: 'curl' },
    externalUrls: { proxyUrl: 'https://proxy.example.com' },
    favicon: '/favicon.svg',
    featuredClients: ['node/fetch'],
    hiddenClients: ['php/guzzle'],
    localization: { locale: 'de' },
    maxVisibleRequestBodyProperties: 0,
    mcp: { name: 'My API', url: 'https://mcp.example.com' },
    metaData: { title: 'My API' },
    oauth2RedirectUri: 'https://app.example.com/oauth/callback',
    pathRouting: { basePath: '/scalar' },
    pluginUrls: ['/plugins/reference.mjs'],
    searchHotKey: 'k',
    servers: [{ url: 'https://api.example.com', description: 'Production' }],
    showExtensions: ['x-scopes'],
    slug: 'my-api',
    title: 'My API',
};

export const symfonyNotes = {
    pathRouting: 'The bundle route only matches the base path. Route nested paths to the same Symfony controller.',
};
