import wdioEslint from '@wdio/eslint'

export default wdioEslint.config([
    {
        ignores: [
            'lib',
            '**/*/dist',
            'playgrounds/**'
        ]
    },
    /**
     * custom test configuration
     */
    {
        files: [
            'test/**/*',
            '__mocks__/**/*'
        ],
        languageOptions: {
            globals: {
                beforeAll: true,
                afterAll: true,
                afterEach: true,
                beforeEach: true
            }
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },
    {
        files: ['src/**/*.ts'],
        plugins: {
            local: {
                rules: {
                    'enforce-options-list': {
                        create(context) {
                            const fileName = context.filename || context.getFilename()
                            const isConstantsFile = fileName.endsWith('src/constants.ts')
                            const definedOptions = new Set()
                            let listNode = null
                            const listElements = new Set()

                            return {
                                VariableDeclarator(node) {
                                    if (node.id.type === 'Identifier') {
                                        if (node.id.name.includes('DEFAULT_OPTIONS')) {
                                            if (isConstantsFile) {
                                                definedOptions.add(node.id.name)
                                            } else {
                                                context.report({
                                                    node: node.id,
                                                    message: `Option '${node.id.name}' must be included in 'src/constants.ts#defaultOptionsList', so it can be globally overridden.`
                                                })
                                            }
                                        }
                                        if (isConstantsFile && node.id.name === 'defaultOptionsList' && node.init && node.init.type === 'ArrayExpression') {
                                            listNode = node
                                            node.init.elements.forEach(el => {
                                                if (el && el.type === 'Identifier') {
                                                    listElements.add(el.name)
                                                }
                                            })
                                        }
                                    }
                                },
                                'Program:exit'() {
                                    if (!listNode) {
                                        return
                                    }

                                    definedOptions.forEach(opt => {
                                        if (!listElements.has(opt)) {
                                            context.report({
                                                node: listNode,
                                                message: `Option '${opt}' must be included in 'defaultOptionsList', so it can be globally overridden in 'src/constants.ts'.`
                                            })
                                        }
                                    })
                                }
                            }
                        }
                    }
                }
            }
        },
        rules: {
            'local/enforce-options-list': 'error'
        }
    }
])
