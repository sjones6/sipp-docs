const remarkAdmonitions = require('remark-admonitions');

module.exports = {
  // ...
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.json'),
          remarkPlugins: [remarkAdmonitions]
        },
      },
    ],
  ],
};