import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    head: [['link', { rel: 'icon', href: '/public/images/favicon.ico' }]],
    title: "WatchAlert",
    description: "智能高效的云原生监控系统！",
    ignoreDeadLinks: 'localhostLinks',
    lastUpdated: false,
    // base: '/w8t-docs/',

    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: "/images/logo.png",
        nav: [
            { text: '首页', link: '/' },
            { text: '文档', link: '/docs/' },
        ],

        search: {
            provider: 'local'
        },

        sidebar: {
            "/docs/": [
                {
                    text: '简介',
                    link: '/docs/'
                },
                {
                    text: '安装文档',
                    collapsed: true,
                    items: [
                        {
                            text: 'Docker安装',
                            link: '/docs/install/docker.md'
                        },
                        {
                            text: 'Kubernetes安装',
                            link: '/docs/install/k8s.md'
                        }
                    ]
                },
                {
                    text: 'Client-go',
                    collapsed: true,
                    items: [
                        {
                            text: '四大客户端',
                            collapsed: true,
                            items: [
                                {
                                    text: 'ClientSet',
                                    link: '/docs/Client-go/ClientSet.md'
                                }
                            ]
                        },
                    ]
                },
                {
                    text: 'Istio',
                    collapsed: true,
                    items: [
                        {
                            text: '优化',
                            collapsed: true,
                            items: [
                                {
                                    text: '降低Istio服务网格中Envoy的内存开销',
                                    link: '/docs/Istio/优化篇/降低Istio服务网格中Envoy的内存开销.md',
                                },
                                {
                                    text: '修改Sidecar Proxy resource limit',
                                    link: '/docs/Istio/优化篇/修改Sidecar Proxy resource limit.md'
                                }
                            ]
                        }
                    ]
                }
            ]
        },

        outline: {
            /**
             * outline 中要显示的标题级别。
             * 单个数字表示只显示该级别的标题。
             * 如果传递的是一个元组，第一个数字是最小级别，第二个数字是最大级别。
             * `'deep'` 与 `[2, 6]` 相同，将显示从 `<h2>` 到 `<h6>` 的所有标题。
             *
             * @default 2
             */
            level: [2, 5],
            /**
             * 显示在 outline 上的标题。
             *
             * @default 'On this page'
             */
            label: '页面导航'
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/w8t-io/WatchAlert' },
        ],

        footer: {
            message: 'Released under the GPL License.',
            copyright: '京ICP备2023000596号-2 Copyright © ' + new Date().getFullYear().toString() + ' By Cairry'
        },


        editLink: {
            pattern: 'https://github.com/w8t-io/WatchAlert/edit/master/:path'
        },

    }
})
