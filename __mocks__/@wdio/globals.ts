import type { RectReturn } from '@wdio/protocols'

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

function getTextFn() {
    return this._text ? this._text() : undefined
}

function getHTMLFn(includeSelectorTag) {
    return this._html ? this._html(includeSelectorTag) : undefined
}

function getComputedLabelFn() {
    return this._computed_label ? this._computed_label() : undefined
}

function getComputedRoleFn() {
    return this._computed_role ? this._computed_role() : undefined
}

function getSizeFn(property: keyof RectReturn) {
    return this._size ? this._size(property) : undefined
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
    getText: getTextFn,
    getHTML: getHTMLFn,
    getComputedLabel: getComputedLabelFn,
    getComputedRole: getComputedRoleFn,
    getSize: getSizeFn,
}

export function $(selector) {
    return {
        ...element,
        selector
    }
}

export function $$(selector) {
    const length = this?._length || 2
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
