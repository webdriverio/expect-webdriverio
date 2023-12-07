const elem: WebdriverIO.Element = {} as any

expect(elem).toBeDisabled()
expect(elem).toHaveAttr('test')
expect(elem).not.toHaveAttr('test')
expect(elem).toBe('bar')

expect(elem).toHaveElementClass('bar')
expect(elem).toHaveElementClassContaining('bar')
expect(elem).toHaveElementProperty('n', 'v', {})
