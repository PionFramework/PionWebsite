// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const math = require('remark-math');
const katex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Pion Framework',
    tagline: 'Modern C++ development without legacy restrictions.',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://your-docusaurus-test-site.com',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'PionFramework', // Usually your GitHub org/user name.
    projectName: 'PionCore', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'ja'],
    },

    plugins: [
        'docusaurus-plugin-sass'
    ],

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    remarkPlugins: [math],
                    rehypePlugins: [katex],
                },
                blog: {
                    showReadingTime: true,
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.scss'),
                },
            }),
        ],
    ],

    stylesheets: [
        {
            href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
            type: 'text/css',
            integrity:
                'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
            crossorigin: 'anonymous',
        }
    ],

    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        (
            {
                // Replace with your project's social card
                image: 'img/docusaurus-social-card.jpg',
                navbar: {
                    title: 'Pion Framework',
                    logo: {
                        alt: 'Pion Framework Logo',
                        src: 'img/logo.svg',
                    },
                    items: [
                        // {
                        //     type: 'docsVersionDropdown',
                        //     position: 'left',
                        //     dropdownActiveClassDisabled: true,
                        //     dropdownItemsAfter: [
                        //         // Archived versions
                        //         // {
                        //         //     to: '/docs/0.0.1',
                        //         //     label: '0.0.1'
                        //         // },
                        //         {
                        //             to: '/versions',
                        //             label: 'All versions',
                        //         },
                        //     ],
                        // },
                        {
                            type: 'docSidebar',
                            sidebarId: 'guideSidebar',
                            position: 'right',
                            label: 'Guide',
                        },
                        {to: '/blog', label: 'Blog', position: 'right'},
                        {
                            type: 'localeDropdown',
                            position: 'right',
                            dropdownItemsAfter: [
                                {
                                    href: 'https://translate.pionframework.io',
                                    label: 'Translate',
                                    target: '_blank',
                                    rel: null,
                                },
                            ]
                        },
                        {
                            href: 'https://github.com/PionFramework',
                            label: 'GitHub',
                            position: 'right',
                        }
                    ],
                },
                colorMode: {
                    defaultMode: 'dark',
                    respectPrefersColorScheme: true
                },
                footer: {
                    style: 'dark',
                    links: [
                        {
                            title: 'Community',
                            items: [
                                {
                                    label: 'Discord',
                                    href: 'https://discord.gg/Byqyq3Ee',
                                }
                            ],
                        },
                        {
                            title: 'More',
                            items: [
                                {
                                    label: 'Blog',
                                    to: '/blog',
                                },
                                {
                                    label: 'GitHub',
                                    href: 'https://github.com/PionFramework/',
                                },
                            ],
                        },
                    ],
                    copyright: `Copyright © ${new Date().getFullYear()} John Stewart.`,
                },
                prism: {
                    theme: lightCodeTheme,
                    darkTheme: darkCodeTheme
                },
            }),
};

module.exports = config;
