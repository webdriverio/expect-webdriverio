
import { test, expect, vi, describe } from 'vitest'
import { expect as expectLib, getConfig, setDefaultOptions } from '../src/index.js'
import { $ } from '@wdio/globals'
import { waitUntil } from '../src/utils.js'

vi.mock('@wdio/globals')

vi.mock('../../../src/constants.js', async () => {
    return await vi.importActual<typeof import('../src/constants.js')>('../src/constants.js')
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

    // TODO dprevost find a way to test the below with mocked in globals
    test.skip('should allow to customized global DEFAULT_OPTIONS', async () => {
        setDefaultOptions({ wait: 500, interval: 50 })

        const config = getConfig()

        expect(config).toEqual(expect.objectContaining({
            wait: 500,
            interval: 50
        }))
    })
})

