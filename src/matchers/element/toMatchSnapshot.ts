import { SnapshotClient } from '@vitest/snapshot'
import { WdioElementMaybePromise } from '../../types.js'
import { executeCommandBe } from '../../utils.js'


let _client: SnapshotClient

function getSnapshotClient(): SnapshotClient {
    if (!_client) {
        _client = new SnapshotClient({
            isEqual: (received, expected) => {
                return received == expected
            },
        })
    }
    return _client
}

export function toMatchSnapshot(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'matchSnapshot'
    return executeCommandBe.call(this, received, fnToMatchSnapShot, options)
}

async function fnToMatchSnapShot(element: WebdriverIO.Element, options?: ExpectWebdriverIO.CommandOptions): Promise<boolean> {
    console.log(options);
    try {
        getSnapshotClient().assert({
            received: element,
            filepath: undefined,
            name: undefined,
            message: undefined,
            isInline: false,
            properties: undefined,
            inlineSnapshot: undefined,
            errorMessage: undefined,
            rawSnapshot: undefined,
        })
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
