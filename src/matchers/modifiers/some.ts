const SOME_TAG = Symbol('expect-webdriverio.some')

export class SomeElementsWrapper<T> {
    readonly [SOME_TAG] = true
    constructor(public readonly elements: T) {}
}

export function some<T>(elements: T): SomeElementsWrapper<T> {
    return new SomeElementsWrapper(elements)
}

export function isSomeWrapper(value: unknown): value is SomeElementsWrapper<unknown> {
    return value instanceof SomeElementsWrapper
}
