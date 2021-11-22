import { ExpectWebdriverIOStandalone } from "./standalone";

export declare const expect: ExpectWebdriverIOStandalone.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIOStandalone.Expect;
    }
}
