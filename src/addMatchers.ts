let expectLib: SomeExpectLib

export const isJasmine = (): boolean => {
    // @ts-ignore
    return Boolean(global.jasmine && global.expect && global.expectAsync && global.jasmine.getEnv && global.jasmine.addMatchers && global.jasmine.addAsyncMatchers)
}

export const loadExpect = (): any => {
    try {
        return expectLib = require('expect')
    } catch (err) {
        return console.error('Failed to load expect package. Make sure it has been installed: npm i expect')
    }
}

export const addMatchers = (): any => {
    // @ts-ignore
    if (global.expect === undefined) {
        // WebdriverIO Test Runner + Mocha/Cucumber (but not Jasmine)
        //
        // by default import expect lib and assign it to global object
        // This is a default behavior for Mocha and CucumberJS
        if (!loadExpect()) { return }
        // @ts-ignore
        global.expect = expectLib
    } else {
        // WebdriverIO standalone mode + Jest
        // @ts-ignore
        expectLib = global.expect
    }

    // check if expect is either Jest or Jasmine
    // @ts-ignore
    if (!global.expect.extend && !isJasmine()) {
        // otherwise allow expect-webdriverio to be used together with some other expect lib
        if (!loadExpect()) { return }
        // @ts-ignore
        global.expectWdio = expectLib
        console.warn('Warning! Unsupported expect lib is used.\n' +
            "Only Jasmine >= 3.3.0 and Jest's expect are supported.\n" +
            "expect-webdriverio is assigned to global.expectWdio")
    }

    // matchers relies on options
    require('./options').setDefaultOptions
    const matchers = require('./matchers').default

    // JEST
    if (expectLib.extend) {
        return expectLib.extend({ ...matchers })
    }

    // JASMINE
    // @ts-ignore
    expectLib = global.jasmine

    return expectLib.getEnv().beforeAll(function addExpectWebdriverIOMatchers(): void {
        expectLib.addMatchers({ ...matchers })
        expectLib.addAsyncMatchers({ ...matchers })
    })
}


