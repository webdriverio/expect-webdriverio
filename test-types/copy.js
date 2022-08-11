import path from 'node:path'
import url from 'node:url'
import { promisify } from 'node:util'

import rimrafImport from 'rimraf'
const rimraf = promisify(rimrafImport)

import shelljs from 'shelljs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// TypeScript project root for testing particular typings
const outDirs = ['default', 'jest', 'jasmine']

const defaultPackages = ['expect', 'jest-matcher-utils']
const jestPackages = ['@types/jest']
const jasminePackages = ['@types/jasmine']

const testFile = 'types.ts'

const artifactDirs = ['node_modules', 'dist', testFile]

/**
 * copy package.json and typings from package to type-generation/test/.../node_modules
 */
async function copy() {
    for (const outDir of outDirs) {
        const packages = [...defaultPackages]
        if (outDir === 'jest') {
            packages.push(...jestPackages)
        }
        if (outDir === 'jasmine') {
            packages.push(...jasminePackages)
        }

        // link node_modules
        for (const packageName of packages) {
            const destination = path.join(__dirname, outDir, 'node_modules', packageName)

            const destDir = destination.split(path.sep).slice(0, -1).join(path.sep)
            shelljs.mkdir('-p', destDir)
            shelljs.ln('-s', path.join(ROOT, 'node_modules', packageName), destination)
        }

        // link test file
        shelljs.ln('-s', path.join(__dirname, testFile), path.join(__dirname, outDir, testFile))

        // copy expect-webdriverio
        const destDir = path.join(__dirname, outDir, 'node_modules', 'expect-webdriverio')

        shelljs.mkdir('-p', destDir)
        shelljs.cp('*.d.ts', destDir)
        shelljs.cp('package.json', destDir)
        shelljs.cp('-r', 'types', destDir)
    }
}

/**
 * delete eventual artifacts from test folders
 */
await Promise.all(
    artifactDirs.map((dir) =>
        Promise.all(outDirs.map((testDir) => rimraf(path.join(__dirname, testDir, dir))))
    )
)

/**
 * if successful, start test
 */
await copy()
