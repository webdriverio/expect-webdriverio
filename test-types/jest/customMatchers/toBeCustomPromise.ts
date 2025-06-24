import type { MatcherFunction } from 'expect'

const toBeCustom: MatcherFunction =
        function (actual: ChainablePromiseElement) {
            const pass = actual
            if (pass) {
                return {
                    message: () => 'failed to be custom',
                    pass: true,
                }
            }
            return {
                message: () => 'failed to not be custom',
                pass: false,
            }
        }

expect.extend({ toBeCustom })