import { expect } from '@wdio/globals'
import { SnapshotClient, type SnapshotResult, type SnapshotStateOptions, type SnapshotUpdateState } from '@vitest/snapshot'
import { NodeSnapshotEnvironment } from '@vitest/snapshot/environment'

import type { Services, Frameworks } from '@wdio/types'

/**
 * only create instance once to avoid memory leak
 */
let service: SnapshotService

export type SnapshotFormat = SnapshotStateOptions['snapshotFormat']
type ResolveSnapshotPathFunction = (path: string, extension: string) => string
interface SnapshotServiceArgs {
    updateState?: SnapshotUpdateState
    resolveSnapshotPath?: ResolveSnapshotPathFunction
    snapshotFormat?: SnapshotFormat
}

class WebdriverIOSnapshotEnvironment extends NodeSnapshotEnvironment {
    #resolveSnapshotPath?: (path: string, extension: string) => string

    constructor (resolveSnapshotPath?: ResolveSnapshotPathFunction) {
        super({})
        this.#resolveSnapshotPath = resolveSnapshotPath
    }

    async resolvePath (filepath: string): Promise<string> {
        if (this.#resolveSnapshotPath) {
            return this.#resolveSnapshotPath(filepath, '.snap')
        }
        return super.resolvePath(filepath)
    }
}

/**
 * Snapshot service to take snapshots of elements.
 * The `@wdio/runner` module will attach this service to the test environment
 * so it can track the current test file and test name.
 *
 * @param {string} updateState update state
 * @return {SnapshotService}
 */
export class SnapshotService implements Services.ServiceInstance {
    #currentFilePath?: string
    #currentTestName?: string
    #options: SnapshotStateOptions
    #snapshotResults: SnapshotResult[] = []
    #snapshotClient = new SnapshotClient({
        isEqual: this.#isEqual.bind(this),
    })

    constructor (options?: SnapshotServiceArgs) {
        const updateSnapshot = (Boolean(process.env.CI) && !options?.updateState)
            ? 'none'
            : options?.updateState
                ? options.updateState
                : 'new'

        // Only set snapshotFormat if user provides explicit options
        const snapshotFormatConfig = options?.snapshotFormat ? {
            printBasicPrototype: false,
            escapeString: false,
            ...options.snapshotFormat
        } : undefined

        this.#options = {
            updateSnapshot,
            snapshotEnvironment: new WebdriverIOSnapshotEnvironment(options?.resolveSnapshotPath),
            ...(snapshotFormatConfig && { snapshotFormat: snapshotFormatConfig })
        } as const
    }

    get currentFilePath () {
        return this.#currentFilePath
    }

    get currentTestName () {
        return this.#currentTestName
    }

    get client () {
        return this.#snapshotClient
    }

    get results () {
        return this.#snapshotResults
    }

    async beforeTest(test: Frameworks.Test) {
        this.#currentFilePath = test.file
        this.#currentTestName = `${test.parent} > ${test.title}`
        await this.#snapshotClient.setup(test.file, this.#options)
    }

    async beforeStep(step: Frameworks.PickleStep, scenario: Frameworks.Scenario) {
        const file = scenario.uri
        const testName = `${scenario.name} > ${step.text}`

        this.#currentFilePath = file
        this.#currentTestName = testName
        await this.#snapshotClient.setup(file, this.#options)
    }

    async after() {
        if (!this.#currentFilePath) {
            return
        }

        const result = await this.#snapshotClient.finish(this.#currentFilePath)
        if (!result) {
            return
        }
        this.#snapshotResults.push(result)
    }

    #isEqual (received: unknown, expected: unknown) {
        try {
            expect(received).toBe(expected)
            return true
        } catch {
            return false
        }
    }

    static initiate (options?: SnapshotServiceArgs) {
        if (!service) {
            service = new SnapshotService(options)
        }
        return service
    }
}

