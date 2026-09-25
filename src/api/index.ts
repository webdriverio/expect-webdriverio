import { some as wdioSome } from '../matchers/modifiers/some.js'
import { multiRemote as wdioMultiRemote } from '../matchers/asymmetrics/multiRemote.js'

/**
 * API allowing to export some feature without the burden of all the initilizations
 */
export const some = wdioSome
export const multiRemote = wdioMultiRemote
