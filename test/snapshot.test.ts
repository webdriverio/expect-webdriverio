import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect, vi, afterEach } from 'vitest'
import type { Frameworks } from '@wdio/types'

import { expect as expectExport, SnapshotService } from '../src/index.js'
import type { WdioMultiRemoteElementArray } from '../src/types.js'
import { browserFactory, chainableElementArrayFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock } from './__mocks__/@wdio/globals.js'

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

test('snapshots the outerHTML of every instance of a multi-remote element, keyed by instance name, when it differs', async () => {
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

test('snapshots the outerHTML shared by every instance of a multi-remote element as is', async () => {
    await service.beforeTest({
        title: 'multi-remote element with the same outerHTML',
        parent: 'parent',
        file: path.join(__dirname, __filename),
    } as Frameworks.Test)
    process.env.WDIO_INTERNAL_TEST = 'true'

    const element = createMultiRemoteElementMock({ chrome: browserFactory(), firefox: browserFactory() }, 'h1')
    vi.mocked(element.getInstance('chrome').getHTML).mockResolvedValue('<h1>Welcome</h1>')
    vi.mocked(element.getInstance('firefox').getHTML).mockResolvedValue('<h1>Welcome</h1>')

    await expectExport(element).toMatchInlineSnapshot('"<h1>Welcome</h1>"')
    await service.after()
})

afterEach(() => {
    vi.unstubAllEnvs()
})

const multiRemoteElementArrayCases = [
    { name: 'MultiRemoteElement[]', toShape: (elements: WdioMultiRemoteElementArray) => Array.from(elements) },
    { name: 'MultiRemoteElementArray', toShape: (elements: WdioMultiRemoteElementArray) => elements },
]

test.each(multiRemoteElementArrayCases)('snapshots the outerHTML of every element of every instance of a multi-remote element array, keyed by instance name, when it differs, as $name', async ({ name, toShape }) => {
    await service.beforeTest({
        title: `multi-remote element array as ${name}`,
        parent: 'parent',
        file: path.join(__dirname, __filename),
    } as Frameworks.Test)
    process.env.WDIO_INTERNAL_TEST = 'true'

    // Instances in another order than the snapshot: the keys are sorted
    const elements = toShape(createMultiRemoteElementArrayMock({ firefox: browserFactory(), chrome: browserFactory() }, 'li', 2)) as unknown as WebdriverIO.MultiRemoteElement[]
    vi.mocked(elements[0].getInstance('chrome').getHTML).mockResolvedValue('<li>Coffee</li>')
    vi.mocked(elements[1].getInstance('chrome').getHTML).mockResolvedValue('<li>Tea</li>')
    vi.mocked(elements[0].getInstance('firefox').getHTML).mockResolvedValue('<li>Café</li>')
    vi.mocked(elements[1].getInstance('firefox').getHTML).mockResolvedValue('<li>Thé</li>')

    await expectExport(elements).toMatchInlineSnapshot(`
      {
        "chrome": [
          "<li>Coffee</li>",
          "<li>Tea</li>",
        ],
        "firefox": [
          "<li>Café</li>",
          "<li>Thé</li>",
        ],
      }
    `)
    // Non-awaited, like `multiRemoteBrowser.$$('li')`
    await expectExport(Promise.resolve(elements)).toMatchInlineSnapshot(`
      {
        "chrome": [
          "<li>Coffee</li>",
          "<li>Tea</li>",
        ],
        "firefox": [
          "<li>Café</li>",
          "<li>Thé</li>",
        ],
      }
    `)
    expect(elements[0].getInstance('chrome').getHTML).toHaveBeenCalledWith({ includeSelectorTag: true })
    await service.after()
})

test.each(multiRemoteElementArrayCases)('snapshots the outerHTML of every element shared by every instance of a multi-remote element array as is, as $name', async ({ name, toShape }) => {
    await service.beforeTest({
        title: `multi-remote element array with the same outerHTML as ${name}`,
        parent: 'parent',
        file: path.join(__dirname, __filename),
    } as Frameworks.Test)
    process.env.WDIO_INTERNAL_TEST = 'true'

    const elements = toShape(createMultiRemoteElementArrayMock({ chrome: browserFactory(), firefox: browserFactory() }, 'li', 2)) as unknown as WebdriverIO.MultiRemoteElement[]
    for (const instance of ['chrome', 'firefox']) {
        vi.mocked(elements[0].getInstance(instance).getHTML).mockResolvedValue('<li>Coffee</li>')
        vi.mocked(elements[1].getInstance(instance).getHTML).mockResolvedValue('<li>Tea</li>')
    }

    await expectExport(elements).toMatchInlineSnapshot(`
      [
        "<li>Coffee</li>",
        "<li>Tea</li>",
      ]
    `)
    await service.after()
})

test('snapshots the outerHTML of the elements each instance found, when instances found a different number of elements', async () => {
    await service.beforeTest({
        title: 'multi-remote element array with a different number of elements',
        parent: 'parent',
        file: path.join(__dirname, __filename),
    } as Frameworks.Test)
    process.env.WDIO_INTERNAL_TEST = 'true'

    const elements = createMultiRemoteElementArrayMock({ chrome: browserFactory(), firefox: browserFactory() }, 'li', 2) as unknown as WebdriverIO.MultiRemoteElement[]
    vi.mocked(elements[0].getInstance('chrome').getHTML).mockResolvedValue('<li>Coffee</li>')
    vi.mocked(elements[1].getInstance('chrome').getHTML).mockResolvedValue('<li>Tea</li>')
    vi.mocked(elements[0].getInstance('firefox').getHTML).mockResolvedValue('<li>Café</li>')
    // WebdriverIO zips the instances results by index: the trailing wrapper holds no element for firefox
    const secondChromeElement = elements[1].getInstance('chrome')
    vi.spyOn(elements[1], 'getInstance').mockImplementation((instance) => {
        if (instance === 'firefox') {
            throw new Error('no element for firefox')
        }
        return secondChromeElement
    })

    await expectExport(elements).toMatchInlineSnapshot(`
      {
        "chrome": [
          "<li>Coffee</li>",
          "<li>Tea</li>",
        ],
        "firefox": [
          "<li>Café</li>",
        ],
      }
    `)
    await service.after()
})

test('snapshots an empty multi-remote $$() as an empty array', async () => {
    await service.beforeTest({
        title: 'empty multi-remote element array',
        parent: 'parent',
        file: path.join(__dirname, __filename),
    } as Frameworks.Test)
    process.env.WDIO_INTERNAL_TEST = 'true'

    const elements = createMultiRemoteElementArrayMock({ chrome: browserFactory(), firefox: browserFactory() }, 'li', 0)

    await expectExport(elements).toMatchInlineSnapshot('[]')
    await service.after()
})

test('snapshots the outerHTML of every element of an element array', async () => {
    await service.beforeTest({
        title: 'element array',
        parent: 'parent',
        file: path.join(__dirname, __filename),
    } as Frameworks.Test)
    process.env.WDIO_INTERNAL_TEST = 'true'

    const chainableElements = chainableElementArrayFactory('li', 2)
    const elements = await chainableElements.getElements()
    vi.mocked(elements[0].getHTML).mockResolvedValue('<li>Coffee</li>')
    vi.mocked(elements[1].getHTML).mockResolvedValue('<li>Tea</li>')

    // Non-awaited `$$()`
    await expectExport(chainableElements).toMatchSnapshot()
    await expectExport(chainableElements).toMatchInlineSnapshot(`
      [
        "<li>Coffee</li>",
        "<li>Tea</li>",
      ]
    `)
    // Awaited `ElementArray`, and a plain `Element[]`
    await expectExport(elements).toMatchInlineSnapshot(`
      [
        "<li>Coffee</li>",
        "<li>Tea</li>",
      ]
    `)
    await expectExport([...elements]).toMatchInlineSnapshot(`
      [
        "<li>Coffee</li>",
        "<li>Tea</li>",
      ]
    `)
    expect(elements[0].getHTML).toHaveBeenCalledWith({ includeSelectorTag: true })
    await service.after()
})

test('keeps snapshotting an empty plain array synchronously', async () => {
    await service.beforeTest({
        title: 'empty array',
        parent: 'parent',
        file: path.join(__dirname, __filename),
    } as Frameworks.Test)
    process.env.WDIO_INTERNAL_TEST = 'true'

    const result = expectExport([]).toMatchInlineSnapshot('[]')

    expect(result).not.toBeInstanceOf(Promise)
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
