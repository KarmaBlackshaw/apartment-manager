module.exports = function (api) {
  const isTest = api.env('test')
  api.cache(true)
  // nativewind/babel pulls in react-native-worklets/plugin which crashes in Jest's node env.
  // In test mode we skip jsxImportSource and nativewind/babel to keep tests runnable.
  return {
    presets: [
      ['babel-preset-expo', isTest
        ? { worklets: false, reanimated: false }
        : { jsxImportSource: 'nativewind' }],
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    plugins: [
      ...(isTest ? [] : ['react-native-reanimated/plugin']),
    ],
  }
}
