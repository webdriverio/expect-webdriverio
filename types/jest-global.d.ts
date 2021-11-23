import { ExpectWebdriverIOStandalone } from './standalone'

declare const expect: ExpectWebdriverIOStandalone.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIOStandalone.Expect
    }
}
