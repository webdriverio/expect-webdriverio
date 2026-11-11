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
export function filterInlineSnapshotStack (
    stack: string,
    snapshotFile = new URL('../matchers/snapshot.js', import.meta.url).pathname
): string[] {
    const snapshotPath = normalizePath(snapshotFile).replace(/^\/(?=[a-z]:\/)/i, '')
    let markerFound = false
    return stack.split('\n').flatMap((line) => {
        const ownFrame = OWN_SNAPSHOT_FRAME.test(line) || normalizePath(line).includes(`${snapshotPath}:`)
        if (ownFrame) {
            if (markerFound) {
                return []
            }
            markerFound = true
            // Loaders can rename the function; Vitest still needs this stack marker.
            return [line.replace(/(\bat )[^()]*(?= \()/, '$1__INLINE_SNAPSHOT__')]
        }
        return line.includes('__EXTERNAL_MATCHER_TRAP__') || JASMINE_CORE_FRAME.test(line) ? [] : [line]
    })
}

function normalizePath (path: string): string {
    try {
        path = decodeURI(path)
    } catch {
        // A literal percent sign in a filename does not have to be URL-encoded.
    }
    return path.replaceAll('\\', '/')
}
