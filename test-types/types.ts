expect({}).toBeDisabled()
expect({}).toHaveAttr('test')
expect('foo').toBe('bar')

expect('foo').toHaveElementClass('bar')
expect('foo').toHaveElementClassContaining('bar')
expect('foo').toHaveElementProperty('n', 'v', {})
