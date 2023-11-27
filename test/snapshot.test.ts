import { test, expect } from 'vitest'
import { expect as expectExport } from '../src/index.js'


test('supports snapshot testing', () => {
    const exp = expectExport;
    expect(exp).toBeDefined()
    expect(exp({}).toMatchSnapshot).toBeDefined()
    exp({ a:"a"}).toMatchSnapshot()
})
