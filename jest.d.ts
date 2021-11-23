import { ExpectWebdriverIOStandalone } from './types/standalone'

declare global {
    namespace jest {
        interface Matchers<R, T> extends ExpectWebdriverIOStandalone.Matchers<R, T> {}
    }
}
