import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { wdioCustomMatchers } from '../src/index.js'

// Each registered matcher needs a public type and a type test for each framework augmentation
const matcherNames = Object.keys(wdioCustomMatchers)
const publicTypes = readFileSync('types/expect-webdriverio.d.ts', 'utf8')
// Comments do not count as a type test. `//` after a space only, so that a URL in a string stays
const withoutComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1')
const typeTests = readdirSync('test-types', { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.test-d.ts'))
    .map((file) => ({ file, content: withoutComments(readFileSync(join('test-types', file), 'utf8')) }))

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
        // A call, `.toHaveText(`, or a reference, `expectTypeOf(expect(el).toHaveText)`
        const untested = matcherNames.filter((name) => !new RegExp(`\\.${name}\\s*[()]`).test(content))

        expect(untested).toEqual([])
    })
})
