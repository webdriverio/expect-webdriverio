import type { CommandOptions } from '../../publicTypes/options.js'
import { elementBooleanGetterMatcher } from '../getterMatcher.js'

export const toBeReadOnly = elementBooleanGetterMatcher<CommandOptions>('toBeReadOnly')
