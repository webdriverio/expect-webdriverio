import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from 'vitest'
import type { Frameworks } from '@wdio/types'

import { expect as expectExport, SnapshotService } from '../src/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const __filename = path.basename(fileURLToPath(import.meta.url))

const service = SnapshotService.initiate({
    resolveSnapshotPath: (path, extension) => path + extension
})

// TODO dprevost the below is missing in the snapshot.test.ts.snap file
// exports[`parent > test 2`] = `
// {
//   "deep": {
//     "nested": {
//       "object": "value",
//     },
//   },
// }
// `;

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