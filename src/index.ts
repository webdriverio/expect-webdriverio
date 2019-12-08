let expectLib: SomeExpectLib
let setDefaultOptions = () => { }

const extend = () => {
    if (global.expect === undefined) {
        // WebdriverIO Test Runner + Mocha/Cucumber (but not Jasmine)
        //
        // by default import expect lib and assign it to global object
        // This is a default behavior for Mocha and CucumberJS
        if (!loadExpect()) { return }
        global.expect = expectLib
    } else {
        // WebdriverIO standalone mode + Jest
        expectLib = global.expect
    }

    // check if expect is either Jest or Jasmine
    if (!global.expect.extend && !isJasmine()) {
        // otherwise allow expect-webdriverio to be used together with some other expect lib
        if (!loadExpect()) { return }
        global.expectWdio = expectLib
        console.warn('Warning! Unsupported expect lib is used.\n' +
            "Only Jasmine >= 3.3.0 and Jest's expect are supported.\n" +
            "expect-webdriverio is assigned to global.expectWdio")
    }

    // matchers relies on options
    setDefaultOptions = require('./options').setDefaultOptions
    const matchers = require('./matchers').default

    // JEST
    if (expectLib.extend) {
        return expectLib.extend({ ...matchers })
    }

    // JASMINE
    expectLib = global.jasmine!

    // Jasmine's (as for 3.5) expect doesn't work with Promises :(
    let addMatchersFn: 'addAsyncMatchers' | 'addMatchers' = 'addMatchers'
    if (!isWdioSyncInstalled()) {
        addMatchersFn = 'addAsyncMatchers'
    }

    return expectLib.getEnv!().beforeAll(function addExpectWebdriverIOMatchers() {
        expectLib[addMatchersFn]!({ ...matchers })
    })
}

const isJasmine = () => {
    return global.jasmine && global.expect && global.expectAsync && global.jasmine.getEnv && global.jasmine.addMatchers && global.jasmine.addAsyncMatchers
}

const loadExpect = () => {
    try {
        return expectLib = require('expect')
    } catch (err) {
        return console.error('Failed to load expect package. Make sure it has been installed: npm i expect')
    }
}

const isWdioSyncInstalled = () => {
    try {
        require('@wdio/sync/package.json').version
        return true
    } catch {
        return false
    }
}

extend()

export const setOptions = setDefaultOptions
