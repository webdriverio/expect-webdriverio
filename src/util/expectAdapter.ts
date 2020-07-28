import { getConfig } from '../options'

const config = getConfig()
const { mode: MODE } = config

/**
 * get proper context or return empty object
 *
 * In Jasmine `this` is either `global` or `undefined`, so we need to return an empty object
 * In Jest `this` is an expectation context with useful properties like `isNot`
 * @param context this
 */
export const getContext = (context?: any): any => global === context ? {} : context || {}

function runJestExpect(fn: (...args: any) => any, args: IArguments): any {
    return fn.apply(this, args)
}

export const buildJasmineFromJestResult = (result: JestExpectationResult, isNot: boolean): any => {
    return {
        pass: result.pass !== isNot,
        message: result.message()
    }
}

export const jestResultToJasmine = (result: JestExpectationResult | Promise<JestExpectationResult>, isNot: boolean): any => {
    if (result instanceof Promise) {
        return result.then(jestStyleResult => buildJasmineFromJestResult(jestStyleResult, isNot))
    }
    return buildJasmineFromJestResult(result, isNot)
}

function runJasmineExpect(fn: (...args: any) => any): any {
    // 2nd and 3rd args are `util` and `customEqualityTesters` that are not used
    const context = getContext(this)
    return {
        compare(...args: any[]): any {
            const result = fn.apply({ ...context, isNot: false }, args)
            return jestResultToJasmine(result, false)
        },
        negativeCompare(...args: any[]): any {
            const result = fn.apply({ ...context, isNot: true }, args)
            return jestResultToJasmine(result, true)
        }
    }
}

export const runExpect = MODE === 'jasmine' ? runJasmineExpect : runJestExpect

