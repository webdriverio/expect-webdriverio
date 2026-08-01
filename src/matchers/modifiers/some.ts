const SOME_TAG = 'expect-webdriverio.some'
const SOME_SYMBOL = Symbol.for(SOME_TAG)

export class SomeElementsWrapper<T> {
    // Not used but keeping in case it is needed in the future for type checking
    readonly [SOME_SYMBOL] = true
    constructor(public readonly elements: T) {}
}

export function some<T>(elements: T): SomeElementsWrapper<T> {
    return new SomeElementsWrapper(elements)
}

export function isSomeWrapper(value: unknown): value is SomeElementsWrapper<unknown> {
    return value instanceof SomeElementsWrapper
}
