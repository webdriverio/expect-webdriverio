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
    getProperty: getPropertyFn
}

function $(selector, ...args) {
    return {
        ...element,
        selector
    }
}

function $$(selector, ...args) {
    const length = this._length || 2
    return Array(length).map((_, index) => {
        return {
            ...element,
            selector,
            index
        }
    })
}

async function waitUntil(condition, { timeout, m, interval }) {
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
        } catch { }
        attemptsLeft --
        await sleep(interval)
    }
    throw new Error('waitUntil: timeout after ' + timeout)
}

const browser = {
    $,
    $$,
    waitUntil,
    getUrl: strFn,
    getTitle: strFn,
    call(fn) { return fn() },
}

global.browser = browser
global.$ = $
global.$$ = $$
