module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  parserOptions: {
    "parser": "babel-eslint"
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },

  extends: [
    "plugin:vue/essential"
  ],

  rules: {
    'no-console': 'off',
  }
}