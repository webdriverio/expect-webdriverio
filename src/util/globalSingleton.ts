import { createRequire } from 'node:module'

const { version } = createRequire(import.meta.url)('../../package.json') as { version: string }
const packageMajorVersion = version.split('.')[0]

/**
 * Returns a value shared across every module instance of this package that ends up
 * loaded in the same process (e.g. Node's require() of an ES module creates a
 * synthetic instance separate from one loaded via import()), by keeping it on
 * `globalThis` under a key namespaced with the package's major version so two
 * incompatible releases loaded in the same process don't share state.
 */
export function getGlobalSingleton<T>(key: string, create: () => T): T {
    const globalKey = Symbol.for(`expect-webdriverio.${key}@${packageMajorVersion}`)
    const globalScope = globalThis as unknown as Record<symbol, T>
    return (globalScope[globalKey] ??= create())
}
