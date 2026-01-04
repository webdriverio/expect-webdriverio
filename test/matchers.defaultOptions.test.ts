
import { test, expect, vi, describe } from 'vitest'
import { expect as expectLib, getConfig, setDefaultOptions } from '../src/index.js'
import { $ } from '@wdio/globals'
import { waitUntil } from '../src/utils.js'

vi.mock('@wdio/globals')

vi.mock('../src/constants.js', async () => ({
    DEFAULT_OPTIONS: {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        ...(await vi.importActual<typeof import('../src/constants.js')>('../src/constants.js')).DEFAULT_OPTIONS,
    }
}))
vi.mock('../src/util/waitUntil.js', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('../src/util/waitUntil.js')>()
    return {
        ...actual,
        waitUntil: vi.spyOn(actual, 'waitUntil')
    }
})

describe('DEFAULT_OPTIONS', () => {

    test('should use wait 2000 and interval 100 from default options by default', async () => {
        const el = await $('selector')
        vi.mocked(el.isDisplayed)
            .mockResolvedValue(false)

        await expect(expectLib(el).toBeDisplayed()).rejects.toThrowError()

        expect(waitUntil).toHaveBeenCalledWith(
            expect.any(Function),
            false,
            expect.objectContaining({ interval: 100, wait: 2000 })
        )
        expect(el.isDisplayed).toHaveBeenCalledTimes(20)
    })

    test('should allow to customized global DEFAULT_OPTIONS', async () => {
        setDefaultOptions({ wait: 500, interval: 50 })

        const config = getConfig()

        expect(config).toEqual(expect.objectContaining({
            wait: 500,
            interval: 50
        }))
    })
})

