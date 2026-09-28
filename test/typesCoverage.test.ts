import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { wdioCustomMatchers } from '../src/index.js'

// Each registered matcher needs a public type and a type test for each framework augmentation
const matcherNames = Object.keys(wdioCustomMatchers)
const publicTypes = readFileSync('types/expect-webdriverio.d.ts', 'utf8')
const typeTests = readdirSync('test-types', { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.test-d.ts'))
    .map((file) => ({ file, content: readFileSync(join('test-types', file), 'utf8') }))

describe('types coverage', () => {
    test('finds the matchers and the type tests', () => {
        expect(matcherNames.length).toBeGreaterThan(30)
        expect(typeTests.length).toBeGreaterThanOrEqual(4)
    })

    test('each matcher has a public type', () => {
        const untyped = matcherNames.filter((name) => !new RegExp(`^\\s*${name}[:(<?]`, 'm').test(publicTypes))

        expect(untyped).toEqual([])
    })

    test.each(typeTests)('each matcher is type-tested in $file', ({ content }) => {
        const untested = matcherNames.filter((name) => !new RegExp(`\\.${name}\\b`).test(content))

        expect(untested).toEqual([])
    })
})
