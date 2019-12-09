import { addMatchers } from './addMatchers'

addMatchers()

// options can be imported only after `addMatchers`
export const setOptions = require('./options').setDefaultOptions
