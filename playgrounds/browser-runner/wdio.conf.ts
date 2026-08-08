
import os from 'node:os'

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
    // outputDir: path.join(__dirname, 'logs', process.env.WDIO_PRESET || 'misc'),
    reporters: ['spec'],
    runner: ['browser', {
        preset: 'vue',
        // rootDir: path.resolve(__dirname, '..'),
        // viteConfig: ({ command, mode }) => {
        //     const env = loadEnv(mode, __dirname, '')
        //     return {
        //         // vite config
        //         define: {
        //             WDIO_ENV_TEST: `${JSON.stringify(env.WDIO_ENV_TEST)}`,
        //             TEST_COMMAND: `${JSON.stringify(command)}`
        //         },
        //     }
        // },
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
