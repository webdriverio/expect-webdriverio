/* eslint-disable @typescript-eslint/no-namespace */
/**
 * INTERNAL USAGE ONLY
 */

declare namespace NodeJS {
    interface Global {
        expect?: SomeExpectLib;
        jasmine?: SomeExpectLib;
        expectAsync?: Record<string, unknown>;
        expectWdio: SomeExpectLib;
    }
}

declare namespace jest {
    interface Expect {
        _expectWebdriverio?: any;
    }
}

interface SomeExpectLib {
    // jasmine
    extend: Function;

    // jest
    addMatchers: Function;
    addAsyncMatchers: Function;
    getEnv: Function;

    _expectWebdriverio: {
        options: {
            wait: number;
            interval?: number;
            message?: string;
        };
        mode: 'jest' | 'jasmine';
    };
}

interface JestExpectationResult {
    pass: boolean;
    message: () => string;
}

type WdioElementMaybePromise =
    WebdriverIO.Element | WebdriverIO.ElementArray |
    Promise<WebdriverIO.Element> | Promise<WebdriverIO.ElementArray>


// wdio stub

declare namespace WebdriverIO {
    interface Element {
        _value: () => boolean | string;
        _attempts: number;
    }
    interface Browser {
        _value: () => string;
        _attempts: number;
    }
}
