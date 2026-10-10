import type { CommandOptions } from '../../publicTypes/options.js'
import { elementBooleanGetterMatcher } from '../getterMatcher.js'

export const toBeSelected = elementBooleanGetterMatcher<CommandOptions>('toBeSelected')
export const toBeChecked = elementBooleanGetterMatcher<CommandOptions>('toBeChecked')
