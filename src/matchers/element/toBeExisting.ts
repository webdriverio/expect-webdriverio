import type { CommandOptions } from '../../publicTypes/options.js'
import { elementBooleanGetterMatcher } from '../getterMatcher.js'

export const toExist = elementBooleanGetterMatcher<CommandOptions>('toExist')
export const toBeExisting = elementBooleanGetterMatcher<CommandOptions>('toBeExisting')
export const toBePresent = elementBooleanGetterMatcher<CommandOptions>('toBePresent')
