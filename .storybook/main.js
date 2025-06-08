

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx)'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-styling',
      options: {
        postCss: true
      }
    }
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  core: {
    builder: '@storybook/builder-webpack5'
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: true
  }
};
export default config;