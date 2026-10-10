import type { ToBeDisplayedOptions } from '../../publicTypes/options.js'
import { elementBooleanGetterMatcher } from '../getterMatcher.js'

export const toBeDisplayed = elementBooleanGetterMatcher<ToBeDisplayedOptions>('toBeDisplayed')
