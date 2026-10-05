# Multi Remote Mocha Playground

This playground project is the equivalent of the mocha playgrounds but specificaly to test multi-remote browsers and multi-remote elements.

## Notes

See [Multi-remote Support](../../docs/MultiRemote.md) for the supported behaviors. The `wdio.conf.ts` enables the recommended feature flag and WebdriverIO environment variables.

The `visual-snapshot.test.ts` tests run the `@wdio/visual-service` matchers on the multi-remote browser and its elements. The baselines are not committed: each run saves them in `visual-snapshot/baseline/`, so that every OS compares its own screenshots. The element visual snapshots need `@wdio/visual-service` 10.2.1 or later ([webdriverio/visual-testing#1238](https://github.com/webdriverio/visual-testing/issues/1238)).
