import * as toHaveClipboardText from './matchers/browser/toHaveClipboardText.js'
import * as toHaveTitle from './matchers/browser/toHaveTitle.js'
import * as toHaveUrl from './matchers/browser/toHaveUrl.js'
import * as toBeElementsArrayOfSize from './matchers/elements/toBeElementsArrayOfSize.js'
import * as toBeClickable from './matchers/element/toBeClickable.js'
import * as toBeDisabled from './matchers/element/toBeDisabled.js'
import * as toBeDisplayed from './matchers/element/toBeDisplayed.js'
import * as toBeDisplayedInViewport from './matchers/element/toBeDisplayedInViewport.js'
import * as toBeEnabled from './matchers/element/toBeEnabled.js'
import * as toBeExisting from './matchers/element/toBeExisting.js'
import * as toBeFocused from './matchers/element/toBeFocused.js'
import * as toBeSelected from './matchers/element/toBeSelected.js'
import * as toHaveAttribute from './matchers/element/toHaveAttribute.js'
import * as toHaveChildren from './matchers/element/toHaveChildren.js'
import * as toHaveClass from './matchers/element/toHaveClass.js'
import * as toHaveHref from './matchers/element/toHaveHref.js'
import * as toHaveHTML from './matchers/element/toHaveHTML.js'
import * as toHaveId from './matchers/element/toHaveId.js'
import * as toHaveSize from './matchers/element/toHaveSize.js'
import * as toHaveElementProperty from './matchers/element/toHaveElementProperty.js'
import * as toHaveText from './matchers/element/toHaveText.js'
import * as toHaveValue from './matchers/element/toHaveValue.js'
import * as toHaveStyle from './matchers/element/toHaveStyle.js'
import * as toBeRequested from './matchers/mock/toBeRequested.js'
import * as toBeRequestedTimes from './matchers/mock/toBeRequestedTimes.js'
import * as toBeRequestedWith from './matchers/mock/toBeRequestedWith.js'
import * as snapshotMatchers from './matchers/snapshot.js'

const matchers = {
    // browser
    ...toHaveClipboardText,
    ...toHaveTitle,
    ...toHaveUrl,

    // ElementArray $$
    ...toBeElementsArrayOfSize,

    // Element $ or ElementArray $$
    ...toBeClickable,
    ...toBeDisabled,
    ...toBeDisplayed,
    ...toBeDisplayedInViewport,
    ...toBeEnabled,
    ...toBeExisting,
    ...toBeFocused,
    ...toBeSelected,
    ...toHaveAttribute,
    ...toHaveChildren,
    ...toHaveClass,
    ...toHaveHref,
    ...toHaveHTML,
    ...toHaveId,
    ...toHaveSize,
    ...toHaveElementProperty,
    ...toHaveText,
    ...toHaveValue,
    ...toHaveStyle,

    // Mock
    ...toBeRequested,
    ...toBeRequestedTimes,
    ...toBeRequestedWith,

    // Snapshot
    ...snapshotMatchers
}

// avoid exporting internal functions
Object.keys(matchers).forEach((key: keyof typeof matchers) => {
    if (key.endsWith('Fn')) {
        delete matchers[key]
    }
})

export default matchers
