import { execFile } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'

/**
 * Installs the packed package in a project outside the repo, as a user does, then type-checks and imports each entry point.
 * - Outside the repo: our `node_modules` (and a `~/node_modules`) must not resolve what the package does not declare.
 * - pnpm `hoist: false`: only the declared dependencies and peers resolve.
 * - No lockfile, on purpose: the dependencies of the package resolve as for a user, who does not get our lockfile.
 *   Only the direct dependencies of the project use the versions of our lockfile. `--prefer-offline` reuses the pnpm cache.
 * Needs a build (`lib/`), as `ts:arethetypeswrong`.
 */

const exec = promisify(execFile)
const fixture = resolve('test-types/package')
const project = mkdtempSync(join(tmpdir(), 'expect-webdriverio-package-'))
const installedVersion = (name) => JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8')).version

const run = async (command, args, cwd = project) => {
    try {
        return (await exec(command, args, { cwd })).stdout
    } catch (error) {
        throw new Error(`${command} ${args.join(' ')} failed in ${cwd}\n${error.stdout}${error.stderr}`)
    }
}

try {
    await run('pnpm', ['pack', '--pack-destination', project], process.cwd())
    const { version } = JSON.parse(readFileSync('package.json', 'utf8'))

    writeFileSync(join(project, 'package.json'), JSON.stringify({
        name: 'consumer',
        private: true,
        type: 'module',
        dependencies: {
            'expect-webdriverio': `file:./expect-webdriverio-${version}.tgz`,
            ...Object.fromEntries(['webdriverio', 'typescript', '@types/jest', '@types/jasmine'].map((name) => [name, installedVersion(name)])),
        },
    }, null, 2))
    writeFileSync(join(project, 'pnpm-workspace.yaml'), 'hoist: false\nallowBuilds:\n  edgedriver: false\n  geckodriver: false\n')
    cpSync(fixture, project, { recursive: true })

    await run('pnpm', ['install', '--prefer-offline'])

    const entries = ['module', 'expect-global', 'jest', 'jasmine', 'jasmine-wdio-expect-async']
    const results = await Promise.allSettled(entries.map((entry) => run('node_modules/.bin/tsc', ['-p', `tsconfig.${entry}.json`])))
    const failures = results.flatMap((result, index) => result.status === 'rejected' ? [`${entries[index]}: ${result.reason.message}`] : [])

    await run('node', ['--input-type=module', '-e', `
        const { expect, wdioCustomMatchers } = await import('expect-webdriverio')
        const { some, multiRemote } = await import('expect-webdriverio/api')
        if (typeof expect !== 'function' || Object.keys(wdioCustomMatchers).length === 0 || !some || !multiRemote) process.exit(1)
    `]).catch((error) => failures.push(`runtime import: ${error.message}`))

    if (failures.length > 0) {
        console.error(failures.join('\n'))
        process.exitCode = 1
    } else {
        console.log(`SUCCESS: the packed package type-checks and imports in a clean project (${entries.join(', ')}).`)
    }
} finally {
    if (process.exitCode) {
        console.error(`Project kept for debugging: ${project}`)
    } else {
        rmSync(project, { recursive: true, force: true })
    }
}
