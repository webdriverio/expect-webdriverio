import type { StringOptions } from '../../publicTypes/options.js'
import { elementStringGetterMatcher } from '../getterMatcher.js'

export const toHaveHref = elementStringGetterMatcher<StringOptions>('toHaveHref')
export const toHaveLink = elementStringGetterMatcher<StringOptions>('toHaveLink')
