// Every function exported here is registered with `expect.extend()`: export only the public matchers, never a helper

// Browser matchers
export { toHaveClipboardText } from './matchers/browser/toHaveClipboardText.js'
export { toHaveCookie } from './matchers/browser/toHaveCookie.js'
export { toHaveLocalStorageItem } from './matchers/browser/toHaveLocalStorageItem.js'
export { toHaveTitle } from './matchers/browser/toHaveTitle.js'
export { toHaveUrl } from './matchers/browser/toHaveUrl.js'

// Element matchers
export { toBeClickable } from './matchers/element/toBeClickable.js'
export { toBeDisabled } from './matchers/element/toBeDisabled.js'
export { toBeDisplayed } from './matchers/element/toBeDisplayed.js'
export { toBeDisplayedInViewport } from './matchers/element/toBeDisplayedInViewport.js'
export { toBeEnabled } from './matchers/element/toBeEnabled.js'
export { toExist, toBeExisting, toBePresent } from './matchers/element/toBeExisting.js'
export { toBeFocused } from './matchers/element/toBeFocused.js'
export { toBeSelected, toBeChecked } from './matchers/element/toBeSelected.js'
export { toBeStable } from './matchers/element/toBeStable.js'
export { toHaveAttribute } from './matchers/element/toHaveAttribute.js'
export { toHaveChildren } from './matchers/element/toHaveChildren.js'
export { toHaveComputedLabel } from './matchers/element/toHaveComputedLabel.js'
export { toHaveComputedRole } from './matchers/element/toHaveComputedRole.js'
export { toHaveElementClass } from './matchers/element/toHaveElementClass.js'
export { toHaveElementProperty } from './matchers/element/toHaveElementProperty.js'
export { toHaveHeight } from './matchers/element/toHaveHeight.js'
export { toHaveHref, toHaveLink } from './matchers/element/toHaveHref.js'
export { toHaveHTML } from './matchers/element/toHaveHTML.js'
export { toHaveId } from './matchers/element/toHaveId.js'
export { toHaveSize } from './matchers/element/toHaveSize.js'
export { toHaveStyle } from './matchers/element/toHaveStyle.js'
export { toHaveTagName } from './matchers/element/toHaveTagName.js'
export { toHaveText } from './matchers/element/toHaveText.js'
export { toHaveValue } from './matchers/element/toHaveValue.js'
export { toHaveWidth } from './matchers/element/toHaveWidth.js'
export { toBeElementsArrayOfSize } from './matchers/elements/toBeElementsArrayOfSize.js'

// Mock matchers
export { toBeRequested } from './matchers/mock/toBeRequested.js'
export { toBeRequestedTimes } from './matchers/mock/toBeRequestedTimes.js'
export { toBeRequestedWith } from './matchers/mock/toBeRequestedWith.js'

// Snapshot matchers
export { toMatchSnapshot, toMatchInlineSnapshot } from './matchers/snapshot.js'
