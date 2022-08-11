/// <reference types="./standalone"/>

declare const expect: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect;
    }
}
