/**
 * Global mocks on root only as vitest support
 * Re-exporting from test folder to benefit from typed mocks
 */
export { browser, $$, $ } from '../../test/__mocks__/@wdio/globals'
