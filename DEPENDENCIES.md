# Draft Overlay Dependencies Documentation

## Working Package Combinations

This document tracks the known working combinations of package versions for the Draft Overlay project. Do not update these versions without thorough testing.

### Core Dependencies
```json
{
  "dependencies": {
    "@testing-library/jest-dom": "5.16.5",
    "@testing-library/react": "13.4.0",
    "@testing-library/user-event": "13.5.0",
    "framer-motion": "6.5.1",        // Stable with React 18
    "postcss-lab-function": "4.2.1",
    "react": "18.2.0",               // Base React version
    "react-dom": "18.2.0",           // Must match React version
    "react-router-dom": "6.4.2",     // Router version
    "react-scripts": "5.0.1",        // CRA version - CRITICAL
    "web-vitals": "2.1.4"
  }
}
```

### Build System
```json
{
  "devDependencies": {
    "@craco/craco": "7.1.0",         // Configuration override for CRA
    "webpack": "5.88.1",             // Webpack core
    "webpack-dev-server": "4.15.1",   // Dev server
    "workbox-webpack-plugin": "7.3.0" // Service worker support
  }
}
```

### CSS Processing Stack
```json
{
  "devDependencies": {
    "autoprefixer": "10.4.21",
    "css-loader": "6.7.3",
    "postcss": "8.5.4",              // Base PostCSS version
    "postcss-flexbugs-fixes": "5.0.2",
    "postcss-import": "16.1.0",
    "postcss-loader": "7.0.2",
    "postcss-preset-env": "7.8.3",
    "style-loader": "3.3.1",
    "tailwindcss": "3.4.17"          // Current Tailwind version
  }
}
```

### Storybook (Optional)
```json
{
  "devDependencies": {
    "@storybook/addon-essentials": "7.0.27",
    "@storybook/addon-links": "7.0.27",
    "@storybook/addon-styling": "1.3.7",
    "@storybook/addon-styling-webpack": "0.0.5",
    "@storybook/preset-create-react-app": "7.6.20",
    "@storybook/react": "7.0.27",
    "@storybook/react-webpack5": "7.0.27",
    "eslint-plugin-storybook": "0.6.15",
    "storybook": "7.0.27"
  }
}
```

### Polyfills & Utilities
```json
{
  "devDependencies": {
    "assert": "2.1.0",
    "browserify-zlib": "0.2.0",
    "buffer": "6.0.3",
    "cross-env": "7.0.3",
    "crypto-browserify": "3.12.1",
    "fork-ts-checker-webpack-plugin": "9.1.0",
    "https-browserify": "1.0.0",
    "os-browserify": "0.3.0",
    "process": "0.11.10",
    "prop-types": "15.8.1",
    "stream-browserify": "3.0.0",
    "stream-http": "3.2.0",
    "url": "0.11.4",
    "util": "0.12.5"
  }
}
```

## Important Notes

1. **Version Locking**: All versions should be locked (no ^ or ~ prefixes) to maintain stability

2. **Critical Dependencies**:
   - react-scripts: 5.0.1 (CRA base)
   - @craco/craco: 7.1.0 (Configuration override)
   - postcss: 8.5.4 (CSS processing)
   - webpack: 5.88.1 (Build system)

3. **CSS Module Support**:
   - Current setup uses CSS Modules
   - Tailwind is available but optional
   - PostCSS configuration is handled by CRACO

4. **Known Working Features**:
   - CSS Modules for component styling
   - Framer Motion animations
   - React Router for navigation
   - Storybook for component development

5. **Before Updating**:
   - Create a new branch
   - Test all components
   - Check build process
   - Verify CSS processing
   - Test animations
   - Confirm browser compatibility

## Troubleshooting

If you encounter issues:
1. Ensure all versions match exactly
2. Clear node_modules and package-lock.json
3. Run fresh `yarn install`
4. Check CRACO configuration
5. Verify PostCSS setup
