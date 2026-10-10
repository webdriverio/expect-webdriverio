import { vi, test, describe, expect } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { expect as wdioExpect } from '../../../src/index.js'

vi.mock('@wdio/globals')

/** A form field (`<input>`, `<select>`, `<textarea>`) has the property as a boolean; another element has no property: `null` */
describe.each([
    { matcherName: 'toBeRequired', property: 'required', state: 'required' },
    { matcherName: 'toBeReadOnly', property: 'readOnly', state: 'read only' },
] as const)('$matcherName', ({ matcherName, property, state }) => {
    const run = (subject: unknown, isNot = false) => {
        const expectation = wdioExpect(subject as WebdriverIO.Element)
        return (isNot ? expectation.not : expectation)[matcherName]({ wait: 0 })
    }

    test(`reads the property ${property} of the element`, async () => {
        const element = await $('#name')
        vi.mocked(element.getProperty).mockResolvedValue(true)

        await run(element)

        expect(element.getProperty).toHaveBeenCalledWith(property)
    })

    test('passes when the property is true, and fails with .not', async () => {
        const element = await $('#name')
        vi.mocked(element.getProperty).mockResolvedValue(true)

        await run(element)
        await expect(run(element, true)).rejects.toThrow(`\
Expect $(\`#name\`) not to be ${state}

Expected: "not ${state}"
Received: "${state}"`)
    })

    test.each([false, null, undefined])('fails when the property is %s, and passes with .not', async (value) => {
        const element = await $('#name')
        vi.mocked(element.getProperty).mockResolvedValue(value)

        await expect(run(element)).rejects.toThrow(`\
Expect $(\`#name\`) to be ${state}

Expected: "${state}"
Received: "not ${state}"`)
        await run(element, true)
    })

    test('checks each element of $$()', async () => {
        const elements = await $$('input')
        vi.mocked(elements[0].getProperty).mockResolvedValue(true)
        vi.mocked(elements[1].getProperty).mockResolvedValue(false)

        await expect(run(elements)).rejects.toThrow(`to be ${state}`)
        vi.mocked(elements[1].getProperty).mockResolvedValue(true)
        await run(elements)
    })
})
