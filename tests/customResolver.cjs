const defaultResolver = require('jest-resolve/build/default_resolver').default;

module.exports = (request, options) => {
  try {
    return defaultResolver(request, options);
  } catch (e) {
    // Fallback for packages that use exports field
    return defaultResolver(request, { ...options, allowResolvedDefaultExports: true });
  }
};
