const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const element = {
    $,
    $$,
    isDisplayed() {
        return this._value ? this._value() : true
    }
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

async function waitUntil(condition, wait, m, interval) {
    if (!Number.isInteger(wait) || wait < 1) {
        throw new Error('wrong args passed to waitUntil fixture')
    }
    let attemptsLeft = wait/interval
    while (attemptsLeft > 0) {
        try {
            const result = await condition()
            if (result) {
                return true
            }
        } catch { }
        attemptsLeft --
        sleep(interval)
    }
    throw new Error('waitUntil: timeout after ' + wait)
}

const browser = {
    $,
    $$,
    waitUntil,
    call(fn) { return fn() },
}

global.browser = browser
global.$ = $
global.$$ = $$
