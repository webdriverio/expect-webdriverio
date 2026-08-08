
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isMac = os.platform() === 'darwin' && process.env.CI

export const config: WebdriverIO.Config = {

    //
    // ==================
    // Specify Test Files
    // ==================
    //
    specs: [
        './test/specs/vue.test.ts',
    ],

    //
    // ============
    // Capabilities
    // ============
    //
    /**
     * capabilities
     */
    capabilities: [
        isMac
            ? {
                browserName: 'safari'
            }
            : {
                browserName: 'chrome',
                browserVersion: 'canary',
            }
    ],

    /**
     * test configurations
     */
    logLevel: 'trace',
    framework: 'mocha',
    reporters: ['spec'],
    runner: ['browser', {
        preset: 'vue',
        viteConfig: {
            resolve: {
                alias: {
                    'expect-webdriverio': path.resolve(__dirname, '../../lib/index.js'),
                },
            }
        }
    }],

    mochaOpts: {
        ui: 'bdd',
        timeout: 150000,
        // require: ['./__fixtures__/setup.js']
    },

    /**
     * in order to test custom matchers added by services, we push a service instance
     * to the service list
     */
    // services: [[{
    //     before() {
    //         expect.extend({
    //             toBeFoo(received) {
    //                 return received === 'foo'
    //                     ? {
    //                         message: () => `expected ${received} not to be foo`,
    //                         pass: true
    //                     }
    //                     : {
    //                         message: () => `expected ${received} to be foo`,
    //                         pass: false
    //                     }
    //             }
    //         })
    //     }
    // }, {}]],

        //
    // =====
    // Hooks
    // =====
    //
    before: () => {
        // Fail on loading expect-webdriverio
        // setOptions({ wait: 250 })
        // setDefaultOptions({ wait: 250 })
        // setFeatureFlags({})
        /**
         * only run this test in lit
         */
        // if (process.env.WDIO_PRESET !== 'lit') {
        //     return
        // }

        // browser.addCommand('someCustomCommand', () => 'Hello World')
    }
}
