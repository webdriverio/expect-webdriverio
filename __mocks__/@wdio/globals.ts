const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function beFn() {
    return this._value ? this._value() : true
}

function strFn() {
    return this._value ? this._value() : ' Valid Text '
}

function getPropertyFn(propName) {
    return this._value ? this._value(propName) : undefined
}

function getTextFn(propName) {
    return this._text ? this._text(propName) : undefined
}

const element = {
    $,
    $$,
    isDisplayed: beFn,
    isDisplayedInViewport: beFn,
    isExisting: beFn,
    isSelected: beFn,
    isClickable: beFn,
    isFocused: beFn,
    isEnabled: beFn,
    getProperty: getPropertyFn,
    getText: getTextFn
}

export function $(selector) {
    return {
        ...element,
        selector
    }
}

export function $$(selector) {
    const length = this._length || 2
    const els: any = Array(length).map((_, index) => {
        return {
            ...element,
            selector,
            index
        }
    })
    // Required to refetch
    const parent: any = element;
    parent._length = length;
    els.parent = parent;

    els.foundWith = "$$";
    // Required to check length prop
    els.props = [];
    els.props.length = length;
    return els;
}

async function waitUntil(condition, { timeout, interval }) {
    if (!Number.isInteger(timeout) || timeout < 1) {
        throw new Error('wrong args passed to waitUntil fixture')
    }
    let attemptsLeft = timeout / interval
    while (attemptsLeft > 0) {
        try {
            const result = await condition()
            if (result) {
                return true
            }
        } catch {
            // don't do anything
        }
        attemptsLeft--
        await sleep(interval)
    }
    throw new Error('waitUntil: timeout after ' + timeout)
}

export const browser = {
    $,
    $$,
    waitUntil,
    getUrl: strFn,
    getTitle: strFn,
    call(fn) { return fn() },
}
