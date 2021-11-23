import { ExpectWebdriverIOStandalone } from './types/standalone'

declare global {
    namespace jasmine {
        interface Matchers<T> extends ExpectWebdriverIOStandalone.Matchers<any, T> {}
        interface AsyncMatchers<T, U> extends ExpectWebdriverIOStandalone.Matchers<Promise<void>, T> {}
    }
}
