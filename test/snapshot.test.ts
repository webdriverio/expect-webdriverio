import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect, vi } from 'vitest'
import type { Frameworks } from '@wdio/types'

import { expect as expectExport, SnapshotService } from '../src/index.js'
import { browserFactory, createMultiRemoteElementMock } from './__mocks__/@wdio/globals.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const __filename = path.basename(fileURLToPath(import.meta.url))

const service = SnapshotService.initiate({
    resolveSnapshotPath: (path, extension) => path + extension
})

test('supports snapshot testing', async () => {
    await service.beforeTest({
        title: 'test',
        parent: 'parent',
        file: path.join(__dirname, __filename),
    } as Frameworks.Test)

    process.env.WDIO_INTERNAL_TEST = 'true'

    const exp = expectExport
    expect(exp).toBeDefined()
    expect(exp({}).toMatchSnapshot).toBeDefined()
    expect(exp({}).toMatchInlineSnapshot).toBeDefined()
    await exp({ a: 'a' }).toMatchSnapshot()
    await exp({ deep: { nested: { object: 'value' } } }).toMatchInlineSnapshot(`
      {
        "deep": {
          "nested": {
            "object": "value",
          },
        },
      }
    `)
    await service.after()

    const expectedSnapfileExist = await fs.access(path.resolve(__dirname, 'snapshot.test.ts.snap'))
        .then(() => true, () => false)
    expect(expectedSnapfileExist).toBe(true)
})

test('snapshots the outerHTML of every instance of a multi-remote element, keyed by instance name', async () => {
    await service.beforeTest({
        title: 'multi-remote element',
        parent: 'parent',
        file: path.join(__dirname, __filename),
    } as Frameworks.Test)
    process.env.WDIO_INTERNAL_TEST = 'true'

    // Instances in another order than the snapshot: the serializer sorts the keys
    const element = createMultiRemoteElementMock({ firefox: browserFactory(), chrome: browserFactory() }, 'h1')
    vi.mocked(element.getInstance('chrome').getHTML).mockResolvedValue('<h1>Welcome</h1>')
    vi.mocked(element.getInstance('firefox').getHTML).mockResolvedValue('<h1>Bienvenue</h1>')

    await expectExport(element).toMatchInlineSnapshot(`
      {
        "chrome": "<h1>Welcome</h1>",
        "firefox": "<h1>Bienvenue</h1>",
      }
    `)
    // Non-awaited, like `multiRemoteBrowser.$('h1')`
    await expectExport(Promise.resolve(element)).toMatchInlineSnapshot(`
      {
        "chrome": "<h1>Welcome</h1>",
        "firefox": "<h1>Bienvenue</h1>",
      }
    `)
    expect(element.getInstance('chrome').getHTML).toHaveBeenCalledWith({ includeSelectorTag: true })
    await service.after()
})

test('supports cucumber snapshot testing', async () => {
    await service.beforeStep({
        text: 'Fake step',
    } as Frameworks.PickleStep, {
        name: 'Fake scenario',
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

test('SnapshotService.initiate() returns the same instance across separately re-evaluated module instances', async () => {
    const first = await import('../src/snapshot.js')
    const firstInstance = first.SnapshotService.initiate()

    // Forces a fresh, separate evaluation of snapshot.ts's top-level code, simulating
    // the dual module instantiation this guards against: the matcher's own
    // SnapshotService.initiate() call and the one @wdio/runner uses to set
    // currentFilePath/currentTestName must resolve to the exact same instance.
    vi.resetModules()
    const second = await import('../src/snapshot.js')
    const secondInstance = second.SnapshotService.initiate()

    expect(secondInstance).toBe(firstInstance)
})
