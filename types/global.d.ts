/// <reference types="./standalone.js"/>
/// <reference types="./expect-webdriverio.d.ts"/>

declare namespace NodeJS {
    interface Global {
        expect: WdioExpect
    }
}