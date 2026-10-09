import type { HTMLOptions } from '../../publicTypes/options.js'
import { elementStringGetterMatcher } from '../getterMatcher.js'

export const toHaveHTML = elementStringGetterMatcher<HTMLOptions>('toHaveHTML')
