import type { RectReturn } from '@wdio/protocols'
import { elementNumberGetterMatcher } from '../getterMatcher.js'

export type Size = Pick<RectReturn, 'width' | 'height'>

export const toHaveSize = elementNumberGetterMatcher('toHaveSize')
