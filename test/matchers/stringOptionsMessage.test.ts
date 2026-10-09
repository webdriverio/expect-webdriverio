import { describe, expect, test, vi } from 'vitest'
import stripAnsi from 'strip-ansi'
import { toHaveText } from '../../src/matchers/element/toHaveText.js'
import { toHaveHTML } from '../../src/matchers/element/toHaveHTML.js'
import { toHaveElementClass } from '../../src/matchers/element/toHaveElementClass.js'
import { toHaveTitle } from '../../src/matchers/browser/toHaveTitle.js'
import { toHaveAttribute } from '../../src/matchers/element/toHaveAttribute.js'
import { toHaveElementProperty } from '../../src/matchers/element/toHaveElementProperty.js'
import { toHaveComputedLabel } from '../../src/matchers/element/toHaveComputedLabel.js'
import { toHaveComputedRole } from '../../src/matchers/element/toHaveComputedRole.js'
import { toHaveUrl } from '../../src/matchers/browser/toHaveUrl.js'
import { toHaveClipboardText } from '../../src/matchers/browser/toHaveClipboardText.js'
import { toHaveLocalStorageItem } from '../../src/matchers/browser/toHaveLocalStorageItem.js'
import { browserFactory, elementArrayFactory, multiRemoteBrowserFactory } from '../__mocks__/@wdio/globals.js'
import { jasmine } from '../__fixtures__/jasmine.js'

vi.mock('@wdio/globals')

/**
 * #2243: the failure message shows the non-default string options in `Expected`, the actual value as is in `Received`,
 * and an element or instance that passed (also only because of the options) as no difference.
 */
describe('failure messages with string options', () => {
    const thisContext = {}
    const wait = { wait: 0 }

    const elementsWith = (getter: 'getText' | 'getHTML' | 'getAttribute', values: string[]) => {
        const elements = elementArrayFactory('items', values.length)
        values.forEach((value, index) => vi.mocked(elements[index][getter]).mockResolvedValue(value))
        return elements
    }

    describe('on one element', () => {
        test('shows the non-default options in Expected, and the actual value as is', async () => {
            const [element] = elementsWith('getText', ['  Hello World  '])

            const result = await toHaveText.call(thisContext, element, 'Other', { ...wait, ignoreCase: true })

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`)[0] to have text

Expected: ignoringCase<"Other">
Received: "  Hello World  "`)
        })

        test('shows Expected as before with the default options only', async () => {
            const [element] = elementsWith('getText', ['  Hello World  '])

            const result = await toHaveText.call(thisContext, element, 'Other', wait)

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`)[0] to have text

Expected: "Other"
Received: "  Hello World  "`)
        })

        test.each([
            { name: 'ignoreCase adds the i flag', options: { ignoreCase: true }, expected: '/foo/i' },
            { name: 'trim: false is named', options: { trim: false }, expected: 'untrimmed</foo/>' },
            { name: 'a position does not apply', options: { containing: true }, expected: '/foo/' },
        ])('shows a RegExp as is: $name', async ({ options, expected }) => {
            const [element] = elementsWith('getText', ['bar'])

            const result = await toHaveText.call(thisContext, element, /foo/, { ...wait, ...options })

            expect(stripAnsi(result.message())).toContain(`Expected: ${expected}\n`)
        })
    })

    describe('on $$()', () => {
        test('shows an element that passed because of the default trim as no difference', async () => {
            const elements = elementsWith('getHTML', ['   <div>foo</div>   ', '   <div>foo</div>   '])

            const result = await toHaveHTML.call(thisContext, elements, ['div', '<div>foo</div>', 'toto'], wait)

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`) to have HTML

- Expected  - 2
+ Received  + 2

  Array [
-   "div",
+   "   <div>foo</div>   ",
    "<div>foo</div>",
-   "toto",
+   undefined,
  ]`)
        })

        test('shows the non-default options on every expected value, also on the element that passed', async () => {
            const elements = elementsWith('getText', ['foo', 'baz'])

            const result = await toHaveText.call(thisContext, elements, ['Foo', 'Bar'], { ...wait, ignoreCase: true })

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`) to have text

- Expected  - 1
+ Received  + 1

  Array [
    ignoringCase<"Foo">,
-   ignoringCase<"Bar">,
+   "baz",
  ]`)
        })

        test('shows an element that passed with toHaveElementClass, which compares each class, as no difference', async () => {
            const elements = elementsWith('getAttribute', ['btn active', 'other'])

            const result = await toHaveElementClass.call(thisContext, elements, ['active', 'btn'], wait)

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`) to have class

- Expected  - 1
+ Received  + 1

  Array [
    "active",
-   "btn",
+   "other",
  ]`)
        })

        test('shows an element that passed a Jasmine asymmetric matcher as no difference', async () => {
            const elements = elementsWith('getText', ['  Foo  ', 'baz'])

            const result = await toHaveText.call(thisContext, elements, [jasmine.stringContaining('Foo') as unknown as AsymmetricMatcher<string>, 'Bar'], wait)

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`) to have text

- Expected  - 1
+ Received  + 1

  Array [
    <jasmine.stringContaining("Foo")>,
-   "Bar",
+   "baz",
  ]`)
        })
    })

    describe('on a multi-remote browser', () => {
        test('shows the instance that passed as no difference', async () => {
            const chrome = browserFactory()
            const firefox = browserFactory()
            vi.mocked(chrome.getTitle).mockResolvedValue('hello')
            vi.mocked(firefox.getTitle).mockResolvedValue('Bye')

            const result = await toHaveTitle.call(thisContext, multiRemoteBrowserFactory({ chrome, firefox }), 'Hello', { ...wait, ignoreCase: true })

            expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": ignoringCase<"Hello">,
-   "firefox": ignoringCase<"Hello">,
+   "firefox": "Bye",
  }`)
        })
    })

    describe('in every matcher with string options', () => {
        const options = { wait: 0, ignoreCase: true }

        test.each([
            { name: 'toHaveText', getter: 'getText', run: (e: WebdriverIO.Element) => toHaveText.call(thisContext, e, 'foo', options) },
            { name: 'toHaveHTML', getter: 'getHTML', run: (e: WebdriverIO.Element) => toHaveHTML.call(thisContext, e, 'foo', options) },
            { name: 'toHaveAttribute', getter: 'getAttribute', run: (e: WebdriverIO.Element) => toHaveAttribute.call(thisContext, e as never, 'data-x', 'foo', options) },
            { name: 'toHaveElementProperty', getter: 'getProperty', run: (e: WebdriverIO.Element) => toHaveElementProperty.call(thisContext, e as never, 'value', 'foo', options) },
            { name: 'toHaveElementClass', getter: 'getAttribute', run: (e: WebdriverIO.Element) => toHaveElementClass.call(thisContext, e, 'foo', options) },
            { name: 'toHaveComputedLabel', getter: 'getComputedLabel', run: (e: WebdriverIO.Element) => toHaveComputedLabel.call(thisContext, e, 'foo', options) },
            { name: 'toHaveComputedRole', getter: 'getComputedRole', run: (e: WebdriverIO.Element) => toHaveComputedRole.call(thisContext, e, 'foo', options) },
        ] as const)('$name on one element', async ({ getter, run }) => {
            const [element] = elementArrayFactory('items', 1)
            vi.mocked(element[getter]).mockResolvedValue('bar' as never)

            const result = await run(element)

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toContain('Expected: ignoringCase<"foo">\nReceived: "bar"')
        })

        test.each([
            { name: 'toHaveTitle', mock: (b: WebdriverIO.Browser) => vi.mocked(b.getTitle).mockResolvedValue('bar'), run: (b: WebdriverIO.Browser) => toHaveTitle.call(thisContext, b as never, 'foo', options) },
            { name: 'toHaveUrl', mock: (b: WebdriverIO.Browser) => vi.mocked(b.getUrl).mockResolvedValue('bar'), run: (b: WebdriverIO.Browser) => toHaveUrl.call(thisContext, b as never, 'foo', options) },
            { name: 'toHaveClipboardText', mock: (b: WebdriverIO.Browser) => vi.mocked(b.execute).mockResolvedValue('bar'), run: (b: WebdriverIO.Browser) => toHaveClipboardText.call(thisContext, b as never, 'foo', options) },
            { name: 'toHaveLocalStorageItem', mock: (b: WebdriverIO.Browser) => vi.mocked(b.execute).mockResolvedValue('bar'), run: (b: WebdriverIO.Browser) => toHaveLocalStorageItem.call(thisContext, b as never, 'key', 'foo', options) },
        ])('$name on one browser', async ({ mock, run }) => {
            const browser = browserFactory()
            mock(browser)

            const result = await run(browser)

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toContain('Expected: ignoringCase<"foo">\nReceived: "bar"')
        })
    })
})
