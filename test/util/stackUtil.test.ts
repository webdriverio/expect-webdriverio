import { describe, expect, test } from 'vitest'
import { filterInlineSnapshotStack } from '../../src/util/stackUtil'

/**
 * The stack of `toMatchInlineSnapshot`, as Node prints it from a test file
 */
const inlineSnapshotStack = (frame: (file: string) => string) => [
    'Error: inline snapshot',
    `    at __INLINE_SNAPSHOT__ (${frame('node_modules/expect-webdriverio/lib/matchers/snapshot.js')}:99:23)`,
    `    at Object.toMatchInlineSnapshot (${frame('node_modules/expect-webdriverio/lib/matchers/snapshot.js')}:123:12)`,
    `    at __EXTERNAL_MATCHER_TRAP__ (${frame('node_modules/expect/build/index.js')}:2160:30)`,
    `    at Object.throwingMatcher [as toMatchInlineSnapshot] (${frame('node_modules/expect/build/index.js')}:2161:15)`,
    `    at Context.<anonymous> (${frame('test/example.e2e.ts')}:208:61)`
].join('\n')

/**
 * Vitest's snapshot manager takes the second frame after `__INLINE_SNAPSHOT__`
 * as the location of the inline snapshot, see `_inferInlineSnapshotStack` in `@vitest/snapshot`.
 */
const snapshotLocation = (trace: string[]) => trace[trace.findIndex((line) => line.includes('__INLINE_SNAPSHOT__')) + 2]

describe('stackUtil', () => {
    describe(filterInlineSnapshotStack, () => {
        test.each([
            ['a POSIX path', (file: string) => `/home/me/project/${file}`],
            ['a Windows path', (file: string) => `D:\\a\\project\\${file.replaceAll('/', '\\')}`],
            ['a file URL of an ES module on Windows', (file: string) => `file:///D:/a/project/${file}`],
            ['a file URL of an ES module on POSIX', (file: string) => `file:///home/me/project/${file}`]
        ])('should locate the inline snapshot in the test with %s', (_, frame) => {
            const trace = filterInlineSnapshotStack(inlineSnapshotStack(frame))

            expect(trace).toHaveLength(4)
            expect(trace[1]).toContain('__INLINE_SNAPSHOT__')
            expect(trace.join('\n')).not.toContain('toMatchInlineSnapshot (')
            expect(trace.join('\n')).not.toContain('__EXTERNAL_MATCHER_TRAP__')
            expect(snapshotLocation(trace)).toContain('example.e2e.ts:208:61')
        })

        test.each([
            ['a POSIX path', '/home/me/project/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:8100:34'],
            ['a Windows path', 'D:\\a\\project\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:8100:34']
        ])('should remove the jasmine-core frames with %s', (_, location) => {
            const stack = `Error: inline snapshot\n    at __INLINE_SNAPSHOT__ (snapshot.js:1:1)\n    at QueueRunner.attempt (${location})`

            expect(filterInlineSnapshotStack(stack)).toEqual([
                'Error: inline snapshot',
                '    at __INLINE_SNAPSHOT__ (snapshot.js:1:1)'
            ])
        })
    })
})
