
import { join } from 'node:path'
import type { VisualServiceOptions } from '@wdio/visual-service'
import { SoftAssertionService, setOptions } from 'expect-webdriverio'

export const config: WebdriverIO.Config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    runner: 'local',

    //
    // ==================
    // Specify Test Files
    // ==================
    //
    specs: [
        './test/specs/**/*.test.ts'
        // './test/specs/**/jasmine-specific.test.ts'
    ],

    //
    // ============
    // Capabilities
    // ============
    //
    maxInstances: 10,
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--headless', '--disable-gpu']
        },
        'wdio-ics:options': {
            logName: 'chrome-jasmine'
        }
    }],

    //
    // ===================
    // Test Configurations
    // ===================
    //
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [
        // Not working with Jasmine yet
        [SoftAssertionService, {}],
        // Not working with Jasmine yet
        [
            'visual',
            {
                baselineFolder: join(process.cwd(), '.tmp/visual/baseline'),
                formatImageName: '{tag}-{logName}-{width}x{height}',
                screenshotPath: join(process.cwd(), '.tmp/visual'),
                savePerInstance: true,
                autoSaveBaseline: true,
                // Block out the changing elements
                blockOutStatusBar: true,
                blockOutToolBar: true
            } satisfies VisualServiceOptions
        ]
    ],
    framework: 'jasmine',
    reporters: ['spec'],
    jasmineOpts: {
        defaultTimeoutInterval: 60000
    },

    //
    // =====
    // Hooks
    // =====
    //
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    before: function (_capabilities, _specs) {
        setOptions({ wait: 500 })
    },
}
