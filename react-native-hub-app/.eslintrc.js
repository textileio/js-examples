module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    useJSXTextNode: true,
    project: './tsconfig.json',
    tsconfigRootDir: '.',
  },
  plugins: ['plugin:@typescript-eslint/recommended'],
  extends: ['plugin:@typescript-eslint/recommended'],
}
