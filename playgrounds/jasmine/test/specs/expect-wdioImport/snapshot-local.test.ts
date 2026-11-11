import { fileURLToPath } from 'node:url'
import { browser } from '@wdio/globals'
import type { Frameworks } from '@wdio/types'
import { expect, SnapshotService } from 'expect-webdriverio'

const file = fileURLToPath(import.meta.url)
const service = SnapshotService.initiate()

describe('Local snapshot lifecycle', () => {
    it('matches multiple snapshots', async () => {
        await service.beforeTest({ file, parent: 'Local snapshot lifecycle', title: 'matches multiple snapshots' } as Frameworks.Test)
        expect(service.currentFilePath).toBe(file)
        expect(service.currentTestName).toBe('Local snapshot lifecycle > matches multiple snapshots')
        await expect('first').toMatchSnapshot()
        await expect('second').toMatchSnapshot('named')
    })

    it('matches synthetic DOM in Chrome', async () => {
        await service.beforeTest({ file, parent: 'Local snapshot lifecycle', title: 'matches synthetic DOM in Chrome' } as Frameworks.Test)
        await browser.url('data:text/html,<h1>local snapshot fixture</h1>')
        await expect($('h1')).toMatchSnapshot()
    })

    afterAll(() => {
        const state = service.client.getSnapshotState(file)
        expect(state.added.total()).toBe(0)
        expect(state.matched.total()).toBe(3)
        expect(state.unmatched.total()).toBe(0)
    })
})
