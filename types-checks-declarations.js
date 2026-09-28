import { execFile } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { promisify } from 'node:util'

/**
 * Type-checks the published declaration files with `skipLibCheck: false`, as a user's compiler reads them.
 * - One program per entry point (test-types/declarations/tsconfig.<entry>.json): a global of one entry cannot hide a
 *   missing name in another.
 * - Each program in the two module modes that users have: `nodenext`, and `preserve` with `bundler` (Vite, Browser Runner).
 * - Only errors in our files fail: errors inside `node_modules` belong to other packages.
 */

const exec = promisify(execFile)
const dir = 'test-types/declarations'
const modes = [['nodenext', 'nodenext'], ['preserve', 'bundler']]

// Errors in our files that we accept, each with its reason (all strings must match)
const knownErrors = [
    // The whole `ExpectWebdriverIO` namespace is the module. Listing each member instead is easy to forget: see the generated types RFC
    ['types/expect-webdriverio.d.ts', 'error TS1203: Export assignment cannot be used when targeting ECMAScript modules'],
]

const entries = readdirSync(dir)
    .map((file) => file.match(/^tsconfig\.(.+)\.json$/)?.[1])
    .filter((entry) => entry && entry !== 'base')

const results = await Promise.all(entries.flatMap((entry) => modes.map(async ([module, moduleResolution]) => {
    const args = ['-p', `${dir}/tsconfig.${entry}.json`, '--module', module, '--moduleResolution', moduleResolution]
    const output = await exec('node_modules/.bin/tsc', args).then(({ stdout }) => stdout, (error) => error.stdout + error.stderr)
    const errors = output.split('\n')
        .filter((line) => line.includes('error TS'))
        .filter((line) => !line.startsWith('node_modules/'))
        .filter((line) => !knownErrors.some((patterns) => patterns.every((pattern) => line.includes(pattern))))
    return { name: `${entry} (${module})`, errors }
})))

const failures = results.filter(({ errors }) => errors.length > 0)
for (const { name, errors } of failures) {
    console.error(`${name}:\n  ${errors.join('\n  ')}`)
}
if (failures.length > 0) {
    process.exit(1)
}
console.log(`SUCCESS: ${results.length} declaration checks without errors in our files.`)
