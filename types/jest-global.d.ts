/// <reference types="./standalone.js"/>

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect;
    }
}
