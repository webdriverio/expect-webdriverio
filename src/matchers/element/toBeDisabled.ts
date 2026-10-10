import type { CommandOptions } from '../../publicTypes/options.js'
import { elementBooleanGetterMatcher } from '../getterMatcher.js'

export const toBeDisabled = elementBooleanGetterMatcher<CommandOptions>('toBeDisabled')
