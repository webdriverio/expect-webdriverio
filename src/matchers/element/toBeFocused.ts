import type { CommandOptions } from '../../publicTypes/options.js'
import { elementBooleanGetterMatcher } from '../getterMatcher.js'

export const toBeFocused = elementBooleanGetterMatcher<CommandOptions>('toBeFocused')
