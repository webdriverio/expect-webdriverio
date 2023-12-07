import { toMatchSnapshot as jestToMatchSnapshot, toMatchInlineSnapshot as jestToMatchInlineSnapshot } from 'jest-snapshot'

export async function toMatchSnapshot(received: any, ...args: any) {
    this.expectation = this.expectation || 'matchSnapshot'
    return jestToMatchSnapshot.call(this, await received, ...args);
}


export async function toMatchInlineSnapshot(received: any, ...args: any) {
    this.expectation = this.expectation || 'matchInlineSnapshot'
    return jestToMatchInlineSnapshot.call(this, await received, ...args)
}
