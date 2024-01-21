import { expect } from '@wdio/globals'
import { SnapshotClient, type SnapshotResult, type SnapshotStateOptions, type SnapshotUpdateState } from '@vitest/snapshot'
import { NodeSnapshotEnvironment } from '@vitest/snapshot/environment'

import type { Services, Frameworks } from '@wdio/types'

/**
 * only create instance once to avoid memory leak
 */
let service: SnapshotService

export class SnapshotService implements Services.ServiceInstance {
    #currentFilePath?: string
    #currentTestName?: string
    #options: SnapshotStateOptions
    #snapshotResults: SnapshotResult[] = []

    #snapshotEnvironment = new NodeSnapshotEnvironment()
    #snapshotClient = new SnapshotClient({
        isEqual: this.#isEqual.bind(this),
    })

    constructor (updateState: SnapshotUpdateState) {
        this.#options = {
            updateSnapshot: updateState,
            snapshotEnvironment: this.#snapshotEnvironment,
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

    beforeTest(test: Frameworks.Test) {
        this.#currentFilePath = test.file
        this.#currentTestName = `${test.parent} > ${test.title}`
        this.#snapshotClient.startCurrentRun(test.file, test.fullTitle, this.#options)
    }

    async afterTest() {
        const result = await this.#snapshotClient.finishCurrentRun()
        if (!result) {
            return
        }
        console.log('push result', result);

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

    static initiate (updateState: SnapshotUpdateState = 'new') {
        if (!service) {
            service = new SnapshotService(updateState)
        }
        return service
    }
}

