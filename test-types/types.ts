/// <reference types="@wdio/globals" />
/// <reference types="expect-webdriverio" />
const elem: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
const wdioExpect = ExpectWebdriverIO.expect

wdioExpect(elem).toBeDisabled()
wdioExpect(elem).toHaveAttr('test')
wdioExpect(elem).not.toHaveAttr('test')
wdioExpect(elem).toBe('bar')

wdioExpect(elem).toHaveElementClass('bar')
wdioExpect(elem).toHaveElementProperty('n', 'v', {})
wdioExpect({ foo: 'bar' }).toMatchSnapshot()
wdioExpect({ foo: 'bar' }).toMatchInlineSnapshot()
