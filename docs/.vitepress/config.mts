import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "ObjectQL",
  description: "A Unified Data Management Framework",
  
  // Scans the docs directory
  srcDir: '.',

  // Ignore dead links from merged documentation
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',
    // Top Navigation
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Protocol', link: '/spec/' },
    ],

    // Sidebar Configuration
    sidebar: {
      // Sidebar for Guide section
      '/guide/': [
        {
          text: 'Developer Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/getting-started' },
            { text: 'Data Modeling', link: '/guide/data-modeling' },
            { text: 'Building AI Apps', link: '/guide/ai' }
          ]
        },
        {
          text: 'Server-Side Logic',
          items: [
            { text: 'Writing Hooks', link: '/guide/logic-hooks' },
            { text: 'Custom Actions', link: '/guide/logic-actions' }
          ]
        }
      ],

      // Sidebar for Spec section
      '/spec/': [
        {
          text: 'Protocol Specifications',
          items: [
            { text: 'Overview', link: '/spec/' },
            { text: 'Metadata Format', link: '/spec/metadata-format' },
            { text: 'Query Language', link: '/spec/query-language' },
            { text: 'HTTP Protocol', link: '/spec/http-protocol' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/objectql/objectql' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 ObjectQL'
    }
  }
})
