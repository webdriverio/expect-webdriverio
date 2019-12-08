import { getConfig } from '../options'

const config = getConfig()
const { mode: MODE } = config

function runJestExpect(fn: Function, args: IArguments) {
    return fn.apply(this, args)
}

function runJasmineExpect(fn: Function) {
    // 2nd and 3rd args are `util` and `customEqualityTesters` that are not used
    const context = getContext(this)
    return {
        compare(...args: any[]) {
            const result = fn.apply({ ...context, isNot: false }, args)
            return jestResultToJasmine(result, false)
        },
        negativeCompare(...args: any[]) {
            const result = fn.apply({ ...context, isNot: true }, args)
            return jestResultToJasmine(result, true)
        }
    }
}

export const runExpect = MODE === 'jasmine' ? runJasmineExpect : runJestExpect

export const jestResultToJasmine = (result: JestExpectationResult | Promise<JestExpectationResult>, isNot: boolean) => {
    if (result instanceof Promise) {
        return result.then(jestStyleResult => buildJasmineFromJestResult(jestStyleResult, isNot))
    }
    return buildJasmineFromJestResult(result, isNot)
}
export const buildJasmineFromJestResult = (result: JestExpectationResult, isNot: boolean) => {
    return {
        pass: result.pass !== isNot,
        message: result.message()
    }
}

/**
 * get proper context or return empty object
 *
 * In Jasmine `this` is either `global` or `undefined`, so we need to return an empty object
 * In Jest `this` is an expectation context with useful properties like `isNot`
 * @param context this
 */
export const getContext = (context?: any) => global === context ? {} : context || {}
