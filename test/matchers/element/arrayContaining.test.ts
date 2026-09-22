import { beforeEach, describe, expect, test, vi } from 'vitest'
import { expect as wdioExpect } from '../../../src/index.js'
import { elementArrayFactory } from '../../__mocks__/@wdio/globals.js'
import { jasmine } from '../../__mocks__/jasmine.js'

vi.mock('@wdio/globals')

const valueMatchers = [
    { name: 'toHaveText', getter: 'getText' },
    { name: 'toHaveHTML', getter: 'getHTML' },
    { name: 'toHaveElementClass', getter: 'getAttribute' },
    { name: 'toHaveComputedLabel', getter: 'getComputedLabel' },
    { name: 'toHaveComputedRole', getter: 'getComputedRole' },
    { name: 'toHaveValue', getter: 'getProperty' },
    { name: 'toHaveId', getter: 'getAttribute' },
    { name: 'toHaveHref', getter: 'getAttribute' },
    { name: 'toHaveLink', getter: 'getAttribute' },
] as const

describe.each(valueMatchers)('$name collection expectations', ({ name, getter }) => {
    let elements: WebdriverIO.ElementArray

    beforeEach(() => {
        elements = elementArrayFactory('items', 3)
        for (const [index, value] of ['First', 'Second', 'Extra'].entries()) {
            vi.mocked(elements[index][getter]).mockResolvedValue(value)
        }
    })

    test('matches a reordered subset and nested matchers without requiring every element to match', async () => {
        await wdioExpect(Promise.resolve(Array.from(elements)))[name](wdioExpect.arrayContaining([
            'Second', wdioExpect.stringMatching(/^First$/),
        ]), { wait: 0 })
        await expect(wdioExpect(elements)[name](wdioExpect.arrayContaining(['Missing']), { wait: 0 }))
            .rejects.toThrow('Missing')
    })

    test('negates the whole snapshot, including inverse matchers', async () => {
        await wdioExpect(elements).not[name](wdioExpect.arrayContaining(['First', 'Missing']), { wait: 0 })
        await wdioExpect(elements)[name](wdioExpect.not.arrayContaining(['Missing']), { wait: 0 })
        await expect(wdioExpect(elements).not[name](wdioExpect.arrayContaining(['First']), { wait: 0 }))
            .rejects.toThrow('First')
    })

    test('leaves raw values and nested matching under the asymmetric matcher control', async () => {
        vi.mocked(elements[0][getter]).mockResolvedValue('  First  ')
        const options = { wait: 0, trim: true, ignoreCase: true, replace: ['First', 'Changed'] } satisfies ExpectWebdriverIO.StringOptions
        await wdioExpect(elements)[name](wdioExpect.arrayContaining(['  First  ']), options)
        await expect(wdioExpect(elements)[name](wdioExpect.arrayContaining(['first']), options))
            .rejects.toThrow('first')
    })
})

describe('named attribute and property collection expectations', () => {
    test('supports the Jasmine utility and pretty-printer protocol with nested matchers', async () => {
        const elements = elementArrayFactory('items', 2)
        vi.mocked(elements[0].getText).mockResolvedValue('First')
        vi.mocked(elements[1].getText).mockResolvedValue('Second')
        await wdioExpect(elements).toHaveText(jasmine.arrayContaining([jasmine.stringContaining('Sec')]), { wait: 0 })
        await expect(wdioExpect(elements).toHaveText(jasmine.arrayContaining(['Missing']), { wait: 0 }))
            .rejects.toThrow('jasmine.arrayContaining')
    })

    test('recognizes a prototype-less collection matcher by its protocol', async () => {
        const elements = elementArrayFactory('items', 2)
        const matcher = {
            asymmetricMatch: (actual: unknown) => Array.isArray(actual) && actual.length === 2,
            toString: () => 'ArrayContaining',
        }
        Object.setPrototypeOf(matcher, null)
        await wdioExpect(elements).toHaveHTML(matcher, { wait: 0 })
    })

    test('reads the requested attribute and preserves missing attributes in the snapshot', async () => {
        const elements = elementArrayFactory('items', 2)
        vi.mocked(elements[0].getAttribute).mockImplementation(async (attribute) => attribute === 'data-label' ? 'First' : 'Wrong')
        vi.mocked(elements[1].getAttribute).mockResolvedValue(null)
        await wdioExpect(elements).toHaveAttribute('data-label', wdioExpect.arrayContaining(['First', null]), { wait: 0 })
        await wdioExpect(elements).not.toHaveAttribute('data-label', wdioExpect.arrayContaining(['Missing']), { wait: 0 })
    })

    test('preserves false, zero, empty strings, null and undefined property values', async () => {
        const values = [false, 0, '', null, undefined]
        const elements = elementArrayFactory('items', values.length)
        elements.forEach((element, index) => {
            vi.mocked(element.getProperty).mockImplementation(async (property) => property === 'value' ? values[index] : 'Wrong')
        })
        await wdioExpect(elements).toHaveElementProperty('value', wdioExpect.arrayContaining(values), { wait: 0 })
    })

    test('retains property asString conversion without converting nullish values', async () => {
        const elements = elementArrayFactory('items', 4)
        for (const [index, value] of [false, 0, null, undefined].entries()) {
            vi.mocked(elements[index].getProperty).mockResolvedValue(value)
        }
        await wdioExpect(elements).toHaveElementProperty('value', wdioExpect.arrayContaining(['false', '0', null, undefined]), {
            wait: 0, asString: true,
        })
    })

    test('keeps array-valued properties on a single element as a scalar property assertion', async () => {
        const [element] = elementArrayFactory('items', 1)
        vi.mocked(element.getProperty).mockResolvedValue(['First', 'Second'])
        await wdioExpect(element).toHaveElementProperty('labels', wdioExpect.arrayContaining(['Second']), { wait: 0 })
        await wdioExpect(element).not.toHaveElementProperty('labels', wdioExpect.arrayContaining(['Missing']), { wait: 0 })
        await wdioExpect(element).toHaveElementProperty('labels', jasmine.arrayContaining([jasmine.stringContaining('Sec')]), { wait: 0 })
    })

    test('passes HTML retrieval options to every element', async () => {
        const elements = elementArrayFactory('items', 2)
        for (const element of elements) {
            vi.mocked(element.getHTML).mockImplementation(async (options) => options?.includeSelectorTag === false ? 'Inner' : '<div>Outer</div>')
        }
        await wdioExpect(elements).toHaveHTML(wdioExpect.arrayContaining(['Inner']), { wait: 0, includeSelectorTag: false })
    })
})
