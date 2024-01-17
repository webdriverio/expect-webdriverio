const elem: WebdriverIO.Element = {} as any
const wdioExpect = ExpectWebdriverIO.expect

wdioExpect(elem).toBeDisabled()
wdioExpect(elem).toHaveAttr('test')
wdioExpect(elem).not.toHaveAttr('test')
wdioExpect(elem).toBe('bar')

wdioExpect(elem).toHaveElementClass('bar')
wdioExpect(elem).toHaveElementClassContaining('bar')
wdioExpect(elem).toHaveElementProperty('n', 'v', {})
wdioExpect({ foo: 'bar' }).toMatchSnapshot()
