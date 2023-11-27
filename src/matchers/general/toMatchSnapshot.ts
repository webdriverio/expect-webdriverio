import { toMatchSnapshot as jestToMatchSnapshot, toMatchInlineSnapshot as jestToMatchInlineSnapshot } from 'jest-snapshot'

export async function toMatchSnapshot(received: any, propertiesOrHint?: object | string, hint?: string) {
    this.expectation = this.expectation || 'matchSnapshot'
    const obj = await received;
    const args = [obj];
    if (propertiesOrHint) {
        args.push(propertiesOrHint);
        if (hint) {
            args.push(hint);
        }
    }
    return jestToMatchSnapshot.apply(this, args);
}


export async function toMatchInlineSnapshot(received: any, propertiesOrSnapshot?: object | string, inlineSnapshot?: string) {
    this.expectation = this.expectation || 'matchInlineSnapshot'
    const obj = await received;
    const args = [obj];
    if (propertiesOrSnapshot) {
        args.push(propertiesOrSnapshot);
        if (inlineSnapshot) {
            args.push(inlineSnapshot);
        }
    }
    return jestToMatchInlineSnapshot.call(this, args)
}
