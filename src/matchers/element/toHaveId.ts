import type { StringOptions } from '../../publicTypes/options.js'
import { elementStringGetterMatcher } from '../getterMatcher.js'

export const toHaveId = elementStringGetterMatcher<StringOptions>('toHaveId')
