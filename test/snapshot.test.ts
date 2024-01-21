import { test, expect } from 'vitest'
import type { Frameworks } from '@wdio/types'

import { expect as expectExport, SnapshotService } from '../src/index.js'

const service = SnapshotService.initiate()
service.beforeTest({
    title: 'test',
    parent: 'parent',
    file: '/foo/bar/file',
} as Frameworks.Test)

test('supports snapshot testing', () => {
    const exp = expectExport;
    expect(exp).toBeDefined()
    expect(exp({}).toMatchSnapshot).toBeDefined()
    expect(exp({}).toMatchInlineSnapshot).toBeDefined()
    exp({ a: 'a' }).toMatchSnapshot()
    exp({ a: 'a' }).toMatchInlineSnapshot()
})
