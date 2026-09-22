import { createRequire } from 'node:module'
import { describe, test, expect } from 'vitest'
import { getGlobalSingleton } from '../../src/util/globalSingleton'

const { version } = createRequire(import.meta.url)('../../package.json') as { version: string }
const packageMajorVersion = version.split('.')[0]

describe(getGlobalSingleton, () => {
    test('creates the value on first call', () => {
        const create = () => ({ value: 'created' })

        const result = getGlobalSingleton('test-create', create)

        expect(result).toEqual({ value: 'created' })
    })

    test('returns the exact same reference on subsequent calls with the same key', () => {
        const first = getGlobalSingleton('test-same-ref', () => ({}))
        const second = getGlobalSingleton('test-same-ref', () => ({}))

        expect(second).toBe(first)
    })

    test('does not call create() again once the value exists', () => {
        let callCount = 0
        const create = () => {
            callCount++
            return { callCount }
        }

        getGlobalSingleton('test-call-count', create)
        getGlobalSingleton('test-call-count', create)
        getGlobalSingleton('test-call-count', create)

        expect(callCount).toBe(1)
    })

    test('different keys never share state', () => {
        const first = getGlobalSingleton('test-key-a', () => ({ id: 'a' }))
        const second = getGlobalSingleton('test-key-b', () => ({ id: 'b' }))

        expect(first).not.toBe(second)
        expect(first).toEqual({ id: 'a' })
        expect(second).toEqual({ id: 'b' })
    })

    test('is backed by globalThis, not module-local state', () => {
        const value = getGlobalSingleton('test-global-backed', () => ({ marker: 'shared' }))

        const globalKey = Object.getOwnPropertySymbols(globalThis)
            .find((sym) => sym.description === `expect-webdriverio.test-global-backed@${packageMajorVersion}`)

        expect(globalKey).toBeDefined()
        expect((globalThis as unknown as Record<symbol, unknown>)[globalKey as symbol]).toBe(value)
    })
})
