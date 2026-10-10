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
import type { AsymmetricMatcher } from '../../src/publicTypes/expectWebdriverIO.js'

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
        test('names the non-default options in the label, and shows the actual value as is', async () => {
            const [element] = elementsWith('getText', ['  Hello World  '])

            const result = await toHaveText.call(thisContext, element, 'Other', { ...wait, ignoreCase: true })

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`)[0] to have text

Expected (trimmedIgnoringCase): "Other"
Received:                       "  Hello World  " (compared as "hello world")`)
        })

        test('aligns the Received label with the Expected label of .not', async () => {
            const [element] = elementsWith('getText', ['  Hello  '])

            const result = await toHaveText.call({ isNot: true }, element, 'hello', { ...wait, ignoreCase: true })

            expect(result.pass).toBe(true) // failure, inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`)[0] not to have text

Expected [not] (trimmedIgnoringCase): "hello"
Received                            : "  Hello  " (compared as "hello")`)
        })

        const html = '<ul>\n  <li>Tea</li>\n  <li>Coffee</li>\n</ul>'
        const expectedHtml = '<ul>\n  <li>Tea</li>\n  <li>Milk</li>\n</ul>'

        test('keeps the line diff of Jest for a multiline value', async () => {
            const [element] = elementsWith('getHTML', [html])

            const result = await toHaveHTML.call(thisContext, element, expectedHtml, wait)

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`)[0] to have HTML

- Expected  - 1
+ Received  + 1

  <ul>
    <li>Tea</li>
-   <li>Milk</li>
+   <li>Coffee</li>
  </ul>`)
        })

        test('keeps the line diff of Jest for a multiline value, and names the non-default options in its header', async () => {
            const [element] = elementsWith('getHTML', [html])

            const result = await toHaveHTML.call(thisContext, element, expectedHtml, { ...wait, ignoreCase: true })

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`)[0] to have HTML

- Expected (ignoringCase)  - 1
+ Received                 + 1

  <ul>
    <li>Tea</li>
-   <li>Milk</li>
+   <li>Coffee</li>
  </ul>`)
        })

        test('shows Expected as before with the default options only', async () => {
            const [element] = elementsWith('getText', ['  Hello World  '])

            const result = await toHaveText.call(thisContext, element, 'Other', wait)

            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`)[0] to have text

Expected (trimmed): "Other"
Received:           "  Hello World  " (compared as "Hello World")`)
        })

        test.each([
            { name: 'ignoreCase adds the i flag', options: { ignoreCase: true }, expected: '/foo/i' },
            { name: 'trim: false alters nothing, so it is not named', options: { trim: false }, expected: '/foo/' },
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
-   trimmed<"div">,
+   "   <div>foo</div>   ", (compared as "<div>foo</div>")
    trimmed<"<div>foo</div>">,
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
+   "firefox": "Bye", (compared as "bye")
  }`)
        })
    })

    describe('in every matcher with string options', () => {
        const options = { wait: 0, ignoreCase: true }

        test.each([
            { name: 'toHaveText', getter: 'getText', run: (e: WebdriverIO.ElementArray) => toHaveText.call(thisContext, e, ['foo', 'bar'], options) },
            { name: 'toHaveHTML', getter: 'getHTML', run: (e: WebdriverIO.ElementArray) => toHaveHTML.call(thisContext, e, ['foo', 'bar'], options) },
            { name: 'toHaveAttribute', getter: 'getAttribute', run: (e: WebdriverIO.ElementArray) => toHaveAttribute.call(thisContext, e as never, 'data-x', ['foo', 'bar'] as never, options) },
            { name: 'toHaveElementProperty', getter: 'getProperty', run: (e: WebdriverIO.ElementArray) => toHaveElementProperty.call(thisContext, e as never, 'value', ['foo', 'bar'] as never, options) },
            { name: 'toHaveElementClass', getter: 'getAttribute', run: (e: WebdriverIO.ElementArray) => toHaveElementClass.call(thisContext, e, ['foo', 'bar'], options) },
            { name: 'toHaveComputedLabel', getter: 'getComputedLabel', run: (e: WebdriverIO.ElementArray) => toHaveComputedLabel.call(thisContext, e, ['foo', 'bar'], options) },
            { name: 'toHaveComputedRole', getter: 'getComputedRole', run: (e: WebdriverIO.ElementArray) => toHaveComputedRole.call(thisContext, e, ['foo', 'bar'], options) },
        ] as const)('$name on a list names the options on each value, and the element that passed is no difference', async ({ getter, run }) => {
            const elements = elementArrayFactory('items', 2)
            vi.mocked(elements[0][getter]).mockResolvedValue('FOO' as never)
            vi.mocked(elements[1][getter]).mockResolvedValue('baz' as never)

            const result = await run(elements)

            expect(stripAnsi(result.message())).toContain(`\
  Array [
    ignoringCase<"foo">,
-   ignoringCase<"bar">,
+   "baz",
  ]`)
        })

        test.each([
            { name: 'toHaveTitle', mock: (b: WebdriverIO.Browser, value: string) => vi.mocked(b.getTitle).mockResolvedValue(value), run: (b: WebdriverIO.MultiRemoteBrowser) => toHaveTitle.call(thisContext, b, 'foo', options) },
            { name: 'toHaveUrl', mock: (b: WebdriverIO.Browser, value: string) => vi.mocked(b.getUrl).mockResolvedValue(value), run: (b: WebdriverIO.MultiRemoteBrowser) => toHaveUrl.call(thisContext, b, 'foo', options) },
            { name: 'toHaveClipboardText', mock: (b: WebdriverIO.Browser, value: string) => vi.mocked(b.execute).mockResolvedValue(value), run: (b: WebdriverIO.MultiRemoteBrowser) => toHaveClipboardText.call(thisContext, b, 'foo', options) },
            { name: 'toHaveLocalStorageItem', mock: (b: WebdriverIO.Browser, value: string) => vi.mocked(b.execute).mockResolvedValue(value), run: (b: WebdriverIO.MultiRemoteBrowser) => toHaveLocalStorageItem.call(thisContext, b, 'key', 'foo', options) },
        ])('$name on a multi-remote browser names the options on each value, and the instance that passed is no difference', async ({ mock, run }) => {
            const chrome = browserFactory()
            const firefox = browserFactory()
            mock(chrome, 'FOO')
            mock(firefox, 'baz')

            const result = await run(multiRemoteBrowserFactory({ chrome, firefox }))

            expect(stripAnsi(result.message())).toContain(`\
  Multi-remote values {
    "chrome": ignoringCase<"foo">,
-   "firefox": ignoringCase<"foo">,
+   "firefox": "baz",
  }`)
        })

        test.each([
            { name: 'one element', run: () => { const [e] = elementArrayFactory('items', 1); vi.mocked(e.getText).mockResolvedValue('bar'); return toHaveText.call(thisContext, e, 'foo', options) } },
            { name: 'one browser', run: () => { const b = browserFactory(); vi.mocked(b.getTitle).mockResolvedValue('bar'); return toHaveTitle.call(thisContext, b as never, 'foo', options) } },
        ])('names the options in the label on $name', async ({ run }) => {
            const result = await run()

            expect(stripAnsi(result.message())).toContain('Expected (ignoringCase): "foo"\nReceived:                "bar"')
        })
    })
})
