/**
 * A stack frame has a path with the separator of the OS, or a `file:///` URL
 * for an ES module, which uses `/` on every OS (also on Windows).
 */
const OWN_SNAPSHOT_FRAME = /expect-webdriverio[\\/]lib[\\/]matchers[\\/]snapshot\.js:/
const JASMINE_CORE_FRAME = /node_modules[\\/]jasmine-core[\\/]/

/**
 * Removes the frames of the snapshot matcher and of jasmine-core from the stack
 * of an inline snapshot, so that Vitest's snapshot manager finds the frame of
 * the test. If a frame stays, every inline snapshot gets the same location.
 */
export function filterInlineSnapshotStack (stack: string): string[] {
    return stack.split('\n').filter((line) => (
        line.includes('__INLINE_SNAPSHOT__') ||
        !(
            line.includes('__EXTERNAL_MATCHER_TRAP__') ||
            OWN_SNAPSHOT_FRAME.test(line)
        )
    )).filter((line) => (
        /**
         * remove jasmine-core stack trace to make it work with jasmine
         */
        !JASMINE_CORE_FRAME.test(line)
    ))
}
