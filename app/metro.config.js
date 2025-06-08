// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  // add 'bin' so require('…/shard1.bin') works
  config.resolver.assetExts.push("bin");
  return config;
})();
