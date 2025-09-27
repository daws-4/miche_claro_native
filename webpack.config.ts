const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env: any, argv: any) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Asegura que devServer existe
  config.devServer = config.devServer || {};

  // Permite que las ventanas emergentes (popups) mantengan comunicación necesaria
  config.devServer.headers = {
    ...(config.devServer.headers || {}),
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    // Si necesitas COEP por otros motivos, puedes añadir:
    // 'Cross-Origin-Embedder-Policy': 'unsafe-none'
  };

  return config;
};