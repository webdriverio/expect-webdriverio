import fs from 'node:fs/promises'
import path from 'node:path'
import { test, expect } from 'vitest'
import type { Frameworks } from '@wdio/types'

import { expect as expectExport, SnapshotService } from '../src/index.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const service = SnapshotService.initiate({
    resolveSnapshotPath: (path, extension) => path + extension
})

test('supports snapshot testing', async () => {
    await service.beforeTest({
        title: 'test',
        parent: 'parent',
        file: `${__dirname}/file`,
    } as Frameworks.Test)

    const exp = expectExport
    expect(exp).toBeDefined()
    expect(exp({}).toMatchSnapshot).toBeDefined()
    expect(exp({}).toMatchInlineSnapshot).toBeDefined()
    await exp({ a: 'a' }).toMatchSnapshot()
    /**
     * doesn't work without running in WebdriverIO test runner context
     */
    // await exp({ a: 'a' }).toMatchInlineSnapshot()
    await service.after()

    const expectedSnapfileExist = await fs.access(path.resolve(__dirname, 'file.snap'))
        .then(() => true, () => false)
    expect(expectedSnapfileExist).toBe(true)
})

test('supports cucumber snapshot testing', async () => {
    await service.beforeStep({
        text: 'test',
    } as Frameworks.PickleStep, {
        uri: `${__dirname}/file.feature`,
    } as Frameworks.Scenario)

    const exp = expectExport
    expect(exp).toBeDefined()
    expect(exp({}).toMatchSnapshot).toBeDefined()
    expect(exp({}).toMatchInlineSnapshot).toBeDefined()
    await exp({ cucum: 'ber' }).toMatchSnapshot()
    await service.after()

    const expectedSnapfileExist = await fs.access(path.resolve(__dirname, 'file.feature.snap'))
        .then(() => true, () => false)
    expect(expectedSnapfileExist).toBe(true)
})

