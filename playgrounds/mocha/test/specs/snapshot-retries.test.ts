import { fileURLToPath } from 'node:url'
import { expect, browser } from '@wdio/globals'
import { SnapshotService } from 'expect-webdriverio'

describe('Snapshot retries', () => {
    let snapshotAttempt = 0
    let ordinaryAttempt = 0

    it('reuses the original key when a later attempt matches', async function () {
        this.retries(1)
        const value = snapshotAttempt++ > 0 ? 'expected' : 'different'
        await expect(value).toMatchSnapshot()
    })

    it('preserves retries after an ordinary failure before any snapshot', async function () {
        this.retries(1)
        if (ordinaryAttempt++ === 0) {
            throw new Error('retry before reaching a snapshot')
        }
        await expect('after ordinary failure').toMatchSnapshot()
    })

    it('matches synthetic DOM in Chrome', async () => {
        await browser.url('data:text/html,<h1>local snapshot fixture</h1>')
        await expect($('h1')).toMatchSnapshot()
    })

    after(() => {
        const state = SnapshotService.initiate().client.getSnapshotState(fileURLToPath(import.meta.url))
        expect(state.added.total()).toBe(0)
        expect(state.unmatched.total()).toBe(0)
    })
})
