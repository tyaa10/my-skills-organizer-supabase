# Webpack to Vite Migration Guide

This guide documents the migration from Webpack to Vite for the Skills Organizer project.

## What Was Migrated

### Build System
- **Webpack** → **Vite** for faster development and builds
- **Webpack Dev Server** → **Vite Dev Server** with instant HMR
- **Webpack plugins** → **Vite plugins** for Vue 2 support

### Configuration Changes

#### 1. Package.json Updates
- Replaced Webpack dependencies with Vite equivalents
- Updated build scripts to use Vite commands
- Removed Webpack-specific dev dependencies

#### 2. Vite Configuration (`vite.config.js`)
- Configured Vue 2 support with `@vitejs/plugin-vue2`
- Set up path aliases (`@` for `src` directory)
- Configured Stylus preprocessor support
- Set up manual chunks for vendor libraries
- Configured public directory for static assets

#### 3. HTML Template Updates
- Updated `index.html` to use Vite's module script loading
- Removed Webpack-specific template variables
- Added proper script module import

#### 4. Asset Handling
- Moved static assets from `static/` to `public/` directory
- Updated asset imports to use Vite's asset handling
- Configured PostCSS for CSS processing

### Dependencies Updated

#### Removed (Webpack-related)
- `webpack` and `webpack-dev-server`
- `webpack-merge`, `html-webpack-plugin`
- `extract-text-webpack-plugin`, `optimize-css-assets-webpack-plugin`
- `uglifyjs-webpack-plugin`, `copy-webpack-plugin`
- `babel-loader`, `css-loader`, `url-loader`, `file-loader`
- `vue-loader`, `vue-style-loader`
- `friendly-errors-webpack-plugin`

#### Added (Vite-related)
- `vite` - Core Vite build tool
- `@vitejs/plugin-vue2` - Vue 2 support for Vite
- `vite-plugin-html` - HTML template processing
- Updated PostCSS and Stylus versions

### Code Changes

#### 1. Import Statements
- Converted `require()` statements to ES6 `import`
- Updated CSS imports to use proper module syntax
- Fixed path aliases to use `@/` consistently

#### 2. Authentication Component
- Updated `SignIn.vue` to use Supabase instead of Firebase
- Removed Firebase UI dependencies
- Added custom authentication form with Supabase integration

#### 3. Asset References
- Updated static asset references to work with Vite
- Moved from Webpack's asset handling to Vite's public directory

## Benefits of Vite Migration

### Performance Improvements
- **Faster Development**: Instant server start and HMR
- **Faster Builds**: Uses esbuild for dependencies and Rollup for production
- **Better Caching**: More efficient dependency pre-bundling

### Developer Experience
- **Instant HMR**: Changes reflect immediately in the browser
- **Better Error Messages**: Clearer error reporting
- **Modern Tooling**: Built-in TypeScript support, modern ES features

### Bundle Optimization
- **Tree Shaking**: Better dead code elimination
- **Code Splitting**: Automatic vendor chunk splitting
- **Asset Optimization**: Built-in asset processing

## New Scripts

```bash
# Development
npm run dev          # Start Vite dev server
npm run start        # Alias for dev

# Building
npm run build        # Build for production with Vite
npm run preview      # Preview production build

# Supabase (unchanged)
npm run supabase:start
npm run supabase:stop
npm run supabase:reset
npm run supabase:deploy
npm run supabase:logs
```

## Configuration Files

### New Files
- `vite.config.js` - Main Vite configuration
- `postcss.config.js` - PostCSS configuration
- `public/` - Static assets directory (replaces `static/`)

### Removed Files
- `build/` - Entire Webpack build directory
- `config/` - Webpack configuration files
- `static/` - Moved to `public/`

## Environment Variables

Create a `.env` file with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**
   - Ensure all imports use proper ES6 syntax
   - Check that path aliases are correctly configured

2. **Asset Loading Issues**
   - Verify assets are in the `public/` directory
   - Check that asset references use correct paths

3. **CSS/Stylus Issues**
   - Ensure Stylus files are properly imported
   - Check PostCSS configuration

4. **Vue Component Issues**
   - Verify Vue 2 plugin is properly configured
   - Check that all Vue components use proper syntax

### Development Tips

1. **Hot Module Replacement**
   - Vite provides instant HMR for most changes
   - Some changes may require a full page refresh

2. **Asset Optimization**
   - Vite automatically optimizes assets in production
   - Use the `public/` directory for static assets

3. **Environment Variables**
   - Use `import.meta.env` instead of `process.env` in client code
   - Prefix variables with `VITE_` for client-side access

## Migration Checklist

- [x] Install Vite and Vue 2 plugin
- [x] Create Vite configuration
- [x] Update package.json scripts
- [x] Migrate static assets to public directory
- [x] Update HTML template
- [x] Convert require() to import statements
- [x] Update CSS imports
- [x] Fix path aliases
- [x] Update authentication component
- [x] Test development server
- [x] Test production build
- [x] Update documentation

## Next Steps

1. **Performance Monitoring**: Monitor build times and bundle sizes
2. **Code Splitting**: Optimize chunk splitting for better loading
3. **Asset Optimization**: Implement image optimization and compression
4. **TypeScript**: Consider migrating to TypeScript for better type safety
5. **Testing**: Update test configuration to work with Vite

## Support

For issues related to this migration:
- Check [Vite Documentation](https://vitejs.dev/)
- Review [Vue 2 Plugin Documentation](https://github.com/underfin/vite-plugin-vue2)
- Open an issue in the project repository
