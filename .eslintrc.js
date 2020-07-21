const path = require("path");
module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: [
        'react', // Uses the recommended rules from @eslint-plugin-react
        '@typescript-eslint',
        'prettier',
        'react-hooks',
        'graphql'
    ],
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
            project: './tsconfig.json',
        },
    },
    rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'graphql/template-strings': [
            'error',
            {
                schemaJsonFilepath: path.resolve(__dirname, './node_modules/up-graphql/graphql.schema.json'),
                tagName: 'graphql',
            },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'prettier/prettier': 'error',
        '@typescript-eslint/no-empty-interface': 0,
        'no-empty-pattern': 0,
        '@typescript-eslint/explicit-member-accessibility': 0,
        'react/prop-types': 0,
        'no-console': 1
    },
    settings: {
        react: {
            version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
        },
    },
    extends: ['plugin:@typescript-eslint/recommended','plugin:prettier/recommended', 'prettier/@typescript-eslint','plugin:react/recommended',],
};