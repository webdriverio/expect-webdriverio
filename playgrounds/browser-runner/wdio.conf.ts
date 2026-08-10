export const config: WebdriverIO.Config = {

    //
    // ====================
    // Runner Configuration
    // ====================
    //
    runner: ['browser', { preset: 'vue' }],

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
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--headless', '--disable-gpu']
        },
    }],

    /**
     * test configurations
     */
    logLevel: 'trace',
    framework: 'mocha',
    reporters: ['spec'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 150000,
    },

    // =====
    // Hooks
    // =====
    //
    before: () => {
        // Fail on loading expect-webdriverio, TODO fix this???
        // setOptions({ wait: 250 })
        // setDefaultOptions({ wait: 250 })
        // setFeatureFlags({})
    },
    afterTest: async function (test, context, { passed, error }) {
        if (!passed) {
        console.log(`Test failed: "${test.title}". Keeping browser open for inspection...`)
        console.log('error:', error)

        // Pause indefinitely (or set a high timeout like 600000 ms / 10 mins)
        // await browser.pause(600000)

        // Alternatively, start an interactive REPL session:
        // await browser.debug()
        }
    }
}
