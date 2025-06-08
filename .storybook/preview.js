import '../src/index.css';
import React from 'react';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#111827'
        }
      ]
    }
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <Story />
      </div>
    )
  ]
};

export default preview;
