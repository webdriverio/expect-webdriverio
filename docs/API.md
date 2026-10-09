# API

When you're writing tests, you often need to check that values meet certain conditions. `expect` gives you access to a number of "matchers" that let you validate different things on the `browser`, an `element` or `mock` object.

**Note**: Browser, element, network and snapshot matchers also support [multi-remote](MultiRemote.md), checking every browser instance with a single expected value or, for browser, element and network matchers, one per instance.

Examples that do not open a page or show their HTML assume the [guinea pig test page](https://guinea-pig.webdriver.io/) is open:

```js
await browser.url('https://guinea-pig.webdriver.io/')
// or, with multi-remote
await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
```

## Soft Assertions

Soft assertions allow you to continue test execution even when an assertion fails. This is useful when you want to check multiple conditions in a test and collect all failures rather than stopping at the first failure. Failures are collected and reported at the end of the test.

### Usage

```js
// Mocha example
it('test page smoke', async () => {
  // These won't throw immediately if they fail
  await expect.soft(await $('header h1').getText()).toEqual('WebdriverJS Testpage');
  await expect.soft(await $('.sometext').getText()).toMatch(/some/);
  
  // Also work with basic matcher
  const h1Text = await $('header h1').getText()
  expect.soft(h1Text).toEqual('WebdriverJS Testpage');

  // Regular assertions still throw immediately
  await expect(await $('.sendBtn').isClickable()).toBe(true);
});

// At the end of the test, all soft assertion failures
// will be reported together with their details
```

### Soft Assertion API

#### expect.soft()

Creates a soft assertion that collects failures instead of immediately throwing errors.

```js
await expect.soft(actual).toBeDisplayed();
await expect.soft(actual).not.toHaveText('Wrong text');
```

#### expect.getSoftFailures()

Get all collected soft assertion failures for the current test.

```js
const failures = expect.getSoftFailures();
console.log(`There are ${failures.length} soft assertion failures`);
```

#### expect.assertSoftFailures()

Manually assert all collected soft failures. This will throw an aggregated error if any soft assertions have failed.

```js
// Manually throw if any soft assertions have failed
expect.assertSoftFailures();
```

#### expect.clearSoftFailures()

Clear all collected soft assertion failures for the current test.

```js
// Clear all collected failures
expect.clearSoftFailures();
```

### Integration with Test Frameworks

The soft assertions feature integrates with WebdriverIO's test runner automatically. By default, it will report all soft assertion failures at the end of each test (Mocha) or step (Cucumber).

To use with WebdriverIO, add the SoftAssertionService to your services list:

```js
// wdio.conf.js
import { SoftAssertionService } from 'expect-webdriverio'

export const config = {
  // ...
  services: [
    // ...other services
    [SoftAssertionService, {}]
  ],
  // ...
}
```

#### Configuration Options

The SoftAssertionService can be configured with options to control its behavior:

```js
// wdio.conf.js
import { SoftAssertionService } from 'expect-webdriverio'

export const config = {
  // ...
  services: [
    // ...other services
    [SoftAssertionService, {
      // Disable automatic assertion at the end of tests (default: true)
      autoAssertOnTestEnd: false
    }]
  ],
  // ...
}
```

##### autoAssertOnTestEnd

- **Type**: `boolean`
- **Default**: `true`

When set to `true` (default), the service will automatically assert all soft assertions at the end of each test and throw an aggregated error if any failures are found. When set to `false`, you must manually call `expect.assertSoftFailures()` to verify soft assertions.

This is useful if you want full control over when soft assertions are verified or if you want to handle soft assertion failures in a custom way.

### Known limitations

The soft assertions service is not supported under Jasmine (e.g. `@wdio/jasmine-framework`) using the global import because Jasmine is already designed to provide similar behavior out of the box.

## Default Options

These default options below are connected to the [`waitforTimeout`](https://webdriver.io/docs/options#waitfortimeout) and [`waitforInterval`](https://webdriver.io/docs/options#waitforinterval) options set in the config.

Only set the options below if you want to wait for specific timeouts for your assertions.

```js
{
    wait: 2000, // ms to wait for expectation to succeed
    interval: 100, // interval between attempts
}
```

If you like to pick different timeouts and intervals, set these options like this:

```js
// wdio.conf.js
import { setDefaultOptions } from 'expect-webdriverio'

export const config = {
    // ...
    before () {
        setDefaultOptions({ wait: 5000 })
    },
    // ...
}
```

### Matcher Options

Every matcher can take several options that allows you to modify the assertion:

##### Command Options

| Name | Type | Details |
| ---- | ---- | ------- |
| <code><var>wait</var></code> | number | time in ms to wait for expectation to succeed. Default: `2000` |
| <code><var>interval</var></code> | number | interval between attempts. Default: `100` |
| <code><var>beforeAssertion</var></code> | function | function to be called before assertion is made |
| <code><var>afterAssertion</var></code> | function | function to be called after assertion is made containing assertion results |
| <code><var>message</var></code> | string | user message to prepend before assertion error |

##### String Options

This option can be applied in addition to the command options when strings are being asserted.

| Name | Type | Details |
| ---- | ---- | ------- |
| <code><var>ignoreCase</var></code> | boolean | apply `toLowerCase` to both actual and expected values. A RegExp expected value is matched case-insensitively instead (the `i` flag is applied), since a pattern cannot be lowercased safely. |
| <code><var>trim</var></code> | boolean | apply `trim` to actual value. Default: `true` |
| <code><var>replace</var></code> | Replacer \| Replacer[] | replace parts of the actual value that match the string/RegExp. The replacer can be a string or a function.
| <code><var>containing</var></code> | boolean | expect actual value to contain expected value, otherwise strict equal. |
| <code><var>asString</var></code> | boolean | might be helpful to force converting property value to string |
| <code><var>atStart</var></code> | boolean | expect actual value to start with the expected value |
| <code><var>atEnd</var></code> | boolean | expect actual value to end with the expected value |
| <code><var>atIndex</var></code> | number | expect actual value to have the expected value at the given index |

Use one position option only: `containing`, `atStart`, `atEnd` or `atIndex`. With 2 or more, the matcher throws at once, also with `.not`: `The string options containing and atStart cannot be used together: use only one of containing, atStart, atEnd and atIndex`. `replace` applies before the position option.

In a failure message, `Received` shows the actual value as is (not trimmed, lowercased or replaced), and `Expected` names the string options that alter the actual value before the comparison. The position comes first (`containing`, `startingWith`, `endingWith`, `matchingAtIndex<n>`), then `trimmed`, `ignoringCase` and `replacing`. `trim` is on by default, so `trimmed` is named only when the actual value had spaces at the start or the end; `trim: false` alters nothing, so it is not named. When no option applies, the expected value is printed as is. For one string value, the name is in the label (`Expected (ignoringCase)`), so that Jest's diff still shows the changed characters, or the changed lines of a multiline value. In a list or per-instance values, each expected value has the name (`ignoringCase<"Foo">`). A RegExp is printed with its flags (`ignoreCase` adds `i`), and `expect.oneOf()` adds `OneOf` to the name. An element or a multi-remote instance that passed, also only because of the options, is a line with no change in the diff. When the options changed the actual value, the message also shows the value that the matcher compared: after `Received` for one value, and after each received value that failed in the diff of a list or per-instance values. It is not shown for a multiline value, or when the same received value was compared in 2 ways (e.g. with a string and with a RegExp).

```ts
await expect($('h1')).toHaveText('Other', { ignoreCase: true, containing: true })
// Expected (containingTrimmedIgnoringCase): "Other"
// Received:                                 "  Hello World  " (compared as "hello world")

await expect($$('li')).toHaveText(['Foo', 'Bar'], { ignoreCase: true })
// texts: "foo", "  Baz  "
//   Array [
//     ignoringCase<"Foo">,
// -   trimmedIgnoringCase<"Bar">,
// +   "  Baz  ", (compared as "baz")
//   ]
```

##### Number Matcher

Number matchers (`toHaveWidth`, `toHaveHeight`, `toHaveChildren`, `toBeElementsArrayOfSize`, `toBeRequestedTimes`, and each field of `toHaveSize`) take a number, a `NumberMatcher`, `expect.oneOf()` with numbers, or an asymmetric matcher as the expected value, and the command options as the next argument, e.g. `toHaveWidth({ gte: 32 }, { wait: 0 })`.

| Name | Type | Details |
| ---- | ---- | ------- |
| <code><var>eq</var></code> | number | equals |
| <code><var>lte</var></code> | number | less then equals |
| <code><var>gte</var></code> | number | greater than or equals |

Give `eq` alone, or a range with `gte`, `lte` or both. The types reject `{}` and `eq` with `gte` or `lte`.

`expect.oneOf()` with numbers is one of these numbers, which a range cannot say: `toHaveWidth(expect.oneOf(100, 200))` passes for 100 or 200, and fails for 150.

An asymmetric matcher compares the number as in `toEqual`, e.g. `expect.closeTo(150.4, 0)` for a size that the browser rounds, and `expect.not.closeTo()`. A list matcher (`expect.arrayContaining()`…) throws, and `expect.multiRemote()` is only for the multi-remote elements and mocks.

##### Deep Equality

Objects are compared with the deep equality of Jest's `toEqual`, the same in every matcher: `toHaveSize`, `toHaveElementProperty` (a property that is not a string), `expect.multiRemote()`, and the asymmetric matchers such as `expect.objectContaining()`.

- An asymmetric matcher works anywhere in the value, e.g. `toHaveSize({ width: expect.any(Number), height: 32 })`.
- A property that is `undefined` is ignored: `{ a: 1, b: undefined }` equals `{ a: 1 }`. For a strict comparison, use `expect(await elem.getProperty('dataset')).toStrictEqual({ a: 1 })`.
- A class instance equals a plain object with the same properties.
- URLs, sets, maps, dates and binary data are compared by their content, see [Deep equality of URLs, sets, maps and binary data](Migrations.md#deep-equality-of-urls-sets-maps-and-binary-data).
- `NaN` equals `NaN`. `+0` and `-0` are not equal.

### Handling HTML Entities

An HTML entity is a piece of text (“string”) that begins with an ampersand (`&`) and ends with a semicolon (`;`). Entities are frequently used to display reserved characters (which would otherwise be interpreted as HTML code), and invisible characters (like non-breaking spaces, e.g. `&nbsp;`).

To find or interact with such element use unicode equivalent of the entity. e.g.:

```html
<div data="Some&nbsp;Value">Some&nbsp;Text</div>
```

```js
const myElem = await $('div[data="Some\u00a0Value"]')
await expect(myElem).toHaveAttribute('data', 'div[Some\u00a0Value')
await expect(myElem).toHaveText('Some\u00a0Text')
```

You can find all unicode references in the [HTML spec](https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references).

**Note:** unicode is case-insensitive hence both `\u00a0` and `\u00A0` works. To find element in browser inspect, remove `u` from unicode e.g.: `div[data="Some\00a0Value"]`

## Browser Matchers

Browser matchers support the multi-remote browser, with a single expected value or one per instance, see [Multi-remote Support](MultiRemote.md#browser-matchers).

### Browsing contexts (tab, window, frame)

The browser matchers also accept a WebdriverIO v10 browsing context: a tab, a window or a frame that `browser.url()`, `browser.newWindow()`, `browser.browsingContexts()` or `context.frame()` give in a WebDriver BiDi session. They read the document of that context, not the one of the current context of the session.

```js
const page = await browser.url('https://webdriver.io/')
await expect(page).toHaveTitle(expect.stringContaining('WebdriverIO'))

const frame = await page.frame(page.$('iframe'))
await expect(frame).toHaveUrl(expect.stringContaining('/embed'))
await expect(frame).toHaveLocalStorageItem('key') // the local storage of the frame's origin
```

- A failure message names the browser, the window or the frame, and its URL, e.g. `Expect chrome's frame (https://webdriver.io/embed) to have title`. It is the URL of the last navigation of the context (`context.url`). A frame found by its element has no URL until `navigate()` or `getUrl()`, so the message shows no URL for it. `toHaveUrl` does not show it, because the `Received` line already shows the URL.
- The title of a frame document without `<title>` is `''`.
- `toHaveClipboardText` sets the clipboard permission for the whole session. In a cross-origin frame, the permissions policy of the page can block `clipboard-read`.
- A browsing context is of one browser: there are no per-instance values.

### toHaveUrl

Checks if browser is on a specific page.

##### Usage

```js
await browser.url('https://webdriver.io/')
await expect(browser).toHaveUrl('https://webdriver.io')
```

##### Usage

```js
await browser.url('https://webdriver.io/')
await expect(browser).toHaveUrl(expect.stringContaining('webdriver'))
```

### toHaveTitle

Checks if website has a specific title.

##### Usage

```js
await browser.url('https://webdriver.io/')
await expect(browser).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js')
await expect(browser).toHaveTitle(expect.stringContaining('WebdriverIO'))
```

### toHaveClipboardText

Checks if the browser has a specific text stored in its clipboard.

##### Usage

```js
import { Key } from 'webdriverio'

await browser.keys([Key.Ctrl, 'a'])
await browser.keys([Key.Ctrl, 'c'])
await expect(browser).toHaveClipboardText('some clipboard text')
await expect(browser).toHaveClipboardText(expect.stringContaining('clipboard text'))
```

### toHaveLocalStorageItem

Checks if browser has a specific item in localStorage with an optional value.

##### Usage

```js
await browser.url('https://webdriver.io/')
// Check if localStorage item exists
await expect(browser).toHaveLocalStorageItem('existingKey')

// Check localStorage item with exact value
await expect(browser).toHaveLocalStorageItem('someLocalStorageKey', 'someLocalStorageValue')

// Check with case insensitive
await expect(browser).toHaveLocalStorageItem('key', 'uppercase', { ignoreCase: true })

// Check with trim
await expect(browser).toHaveLocalStorageItem('key', 'value', { trim: true })

// Check with containing
await expect(browser).toHaveLocalStorageItem('key', 'long', { containing: true })

// Check with regex
await expect(browser).toHaveLocalStorageItem('userId', /^user_\d+$/)
```

## Element Matchers

### Matching a subset of element values

Use `expect.arrayContaining()` to match values from an element collection in any order, allowing extra elements. This works with `toHaveText`, `toHaveHTML`, `toHaveAttribute`, `toHaveElementProperty`, `toHaveValue`, `toHaveElementClass`, `toHaveComputedLabel`, `toHaveComputedRole`, `toHaveId`, and `toHaveHref` (including their aliases). To compare with `expect.oneOf()`, see [Choosing the expected value](MultipleElements.md#choosing-the-expected-value).

```js
await expect($$('header a')).toHaveText(expect.arrayContaining(['2', '1']))
await expect($$('form input')).toHaveValue(expect.arrayContaining(['b', 'a']))
await expect($$('a')).toHaveAttribute('href', expect.arrayContaining([expect.stringContaining('two.html')]))
await expect($$('button')).not.toHaveComputedLabel(expect.arrayContaining(['Delete']))
```

The other list matchers also compare the complete array: `expect.arrayOf()` (every value matches) and Jasmine's `jasmine.arrayWithExactContents()` (the same count, and each value in any order; Jasmine does not count a repeated expected value). See the comparison tables for [Jest](Framework.md#matching-a-list-of-elements) and [Jasmine](Framework.md#matching-a-list-of-elements-1).

```js
await expect($$('ul > li')).toHaveText(expect.arrayOf(expect.stringMatching(/^(Tea|Coffee)$/)))
await expect($$('ul > li')).toHaveText(jasmine.arrayWithExactContents(['Coffee', 'Tea']))
```

Each attempt reads one value per element concurrently and applies the asymmetric matcher once to the complete array. Selector-backed collections are refetched on retries. Nested matchers, `.not`, and `expect.not.arrayContaining()` retain their normal matching rules. An empty collection matches `arrayContaining([])`; static empty arrays cannot be retried into a non-empty result.

String comparison options such as `trim`, `ignoreCase`, and `containing` do not transform the collected values or nested matchers. Getter options still apply, such as `includeSelectorTag` for HTML and `asString` for properties. Class matching collects each element's complete class attribute, not individual class tokens.

This collection comparison does not change boolean assertions, style or size assertions, or `some()`'s per-element matching.

On a single element `$()`, a list matcher throws an error, also with `.not`: `toHaveHTML with a list matcher (arrayContaining, arrayWithExactContents or arrayOf) requires an array of elements`. The value of one element is a string, so a list matcher can never match it. Only `toHaveElementProperty` compares a list matcher with the property of a single element, because a property value can be an array.

### toBeDisplayed

Calls [`isDisplayed`](https://webdriver.io/docs/api/element/isDisplayed/) on given element.

##### Usage

```js
await expect($('#someElem')).toBeDisplayed()
```

### toExist

Calls [`isExisting`](https://webdriver.io/docs/api/element/isExisting) on given element.

##### Usage

```js
await expect($('#someElem')).toExist()
```

### toBePresent

Same as `toExist`.

##### Usage

```js
await expect($('#someElem')).toBePresent()
```

### toBeExisting

Same as `toExist`.

##### Usage

```js
const elem = await $('#someElem')
await expect(elem).toBeExisting()
```

### toBeFocused

Checks if element has focus. This assertion only works in a web context.

##### Usage

```js
const elem = await $('#someElem')
await expect(elem).toBeFocused()
```

### toHaveAttribute

Checks if an element has a certain attribute with a specific value.

##### Usage

```js
const myInput = await $('.searchinput')
await expect(myInput).toHaveAttribute('name', 'searchinput')
await expect(myInput).toHaveAttribute('name', expect.stringContaining('search'))
```

Checks if an element has a specific attribute.

##### Usage

```js
const myInput = await $('.searchinput')
await expect(myInput).toHaveAttribute('name')
// With options
await expect(myInput).toHaveAttribute('name', expect.anything(), { wait: 1000 })
```

Checks if an element does not have the specified attribute.

##### Usage

```js
const myInput = await $('.searchinput')
await expect(myInput).not.toHaveAttribute('disabled')
// With options
await expect(myInput).not.toHaveAttribute('disabled', expect.anything(), { wait: 1000 })
```

### toHaveElementClass

Checks if one of the classes of an element matches the expected value: a class name, a regular expression or an asymmetric matcher. Each class is compared, also with an asymmetric matcher. To compare the full `class` attribute, use `toHaveAttribute('class', ...)`.

##### Usage

```js
const box = await $('#purplebox')
await expect(box).toHaveElementClass('box', { message: 'Not a box!' })
await expect(box).toHaveElementClass(expect.stringContaining('purp'), { message: 'Not a purple box!' })

// has any of the classes
await expect(box).toHaveElementClass(expect.oneOf('purple', 'red'))

// has all the classes: 1 assertion for each class
await expect(box).toHaveElementClass('box')
await expect(box).toHaveElementClass('purple')
```

An array of expected values works only with `$$()`: one expected value for each element. On a single element, it fails the assertion.

### toHaveElementProperty

Checks if an element has a certain property and value. A string property is compared with the [string options](#string-options). Another property (a number, a boolean, an object) is compared with [deep equality](#deep-equality), also with an asymmetric matcher in it, or with `expect.oneOf()` with numbers.

##### Usage

```js
const elem = await $('#elem')
await expect(elem).toHaveElementProperty('height', 23)
await expect(elem).not.toHaveElementProperty('height', 0)
await expect(elem).toHaveElementProperty('checked', true)
await expect(elem).toHaveElementProperty('dataset', { id: '1', count: expect.any(String) })
```

Checks if an element has a certain property.

##### Usage

```js
const elem = await $('#elem')
await expect(elem).toHaveElementProperty('height')
// With options
await expect(elem).toHaveElementProperty('height', expect.anything(), { wait : 1 })

// Does not have height property
await expect(elem).not.toHaveElementProperty('height')
// With options
await expect(elem).not.toHaveElementProperty('height', expect.anything(), { wait : 1 })
```

### toHaveValue

Checks if an input element has a certain value.

##### Usage

```js
const myInput = await $('.waitForValueEnabled')
await expect(myInput).toHaveValue('Some Content', { ignoreCase: true })
await expect(myInput).toHaveValue(expect.stringContaining('Content'), { ignoreCase: true })
```

### toBeClickable

Checks if an element can be clicked by calling [`isClickable`](https://webdriver.io/docs/api/element/isClickable) on the element.

##### Usage

```js
await expect($('#elem')).toBeClickable()
```

### toBeDisabled

Checks if an element is disabled by calling [`isEnabled`](https://webdriver.io/docs/api/element/isEnabled) on the element.

##### Usage

```js
const elem = await $('#elem')
await expect(elem).toBeDisabled()
// same as
await expect(elem).not.toBeEnabled()
```

### toBeEnabled

Checks if an element is enabled by calling [`isEnabled`](https://webdriver.io/docs/api/element/isEnabled) on the element.

##### Usage

```js
const elem = await $('#elem')
await expect(elem).toBeEnabled()
// same as
await expect(elem).not.toBeDisabled()
```

### toBeSelected

Checks if an element is enabled by calling [`isSelected`](https://webdriver.io/docs/api/element/isSelected) on the element.

##### Usage

```js
await expect($('#elem')).toBeSelected()
```

### toBeChecked

Same as `toBeSelected`.

##### Usage

```js
await expect($('#elem')).toBeChecked()
```

### toHaveComputedLabel

Checks if element has a specific computed WAI-ARIA label. Use `expect.oneOf()` when the element can have different labels.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('a.navbar__link.header-github-link')
await expect(elem).toHaveComputedLabel('GitHub repository')
await expect(elem).toHaveComputedLabel(expect.stringContaining('repository'))
```

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('a.navbar__link.header-github-link')
await expect(elem).toHaveComputedLabel(expect.oneOf('GitHub repository', 'Private repository'))
await expect(elem).toHaveComputedLabel(expect.oneOf(expect.stringContaining('GitHub'), expect.stringContaining('Private')))
```

### toHaveComputedRole

Checks if element has a specific computed WAI-ARIA role. Use `expect.oneOf()` when the element can have different roles.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('[aria-label="Skip to main content"]')
await expect(elem).toHaveComputedRole('region')
await expect(elem).toHaveComputedRole(expect.stringContaining('ion'))
```

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('[aria-label="Skip to main content"]')
await expect(elem).toHaveComputedRole(expect.oneOf('region', 'section'))
await expect(elem).toHaveComputedRole(expect.oneOf(expect.stringContaining('reg'), expect.stringContaining('sec')))
```

### toHaveHref

Checks if link element has a specific link target.

##### Usage

```js
const link = await $('#githubRepo')
await expect(link).toHaveHref('https://github.com')
await expect(link).toHaveHref(expect.stringContaining('github.com'))
```

### toHaveLink

Same as `toHaveHref`.

##### Usage

```js
const link = await $('#githubRepo')
await expect(link).toHaveLink('https://github.com')
await expect(link).toHaveLink(expect.stringContaining('github.com'))
```

### toHaveId

Checks if element has a specific `id` attribute.

##### Usage

```js
await expect($('#elem')).toHaveId('elem')
```

### toHaveStyle

Checks if an element has specific `CSS` properties. By default, values must match exactly. Only the `CSS` properties you specify are validated; other properties on the element are ignored. Each value is compared as in `toHaveText`: the [string options](#string-options) apply to each value (`trim` removes surrounding spaces from the actual value only and leaves the expected value unchanged), and a value can be a RegExp, an asymmetric matcher or `expect.oneOf()`. The failure message shows each CSS value as is, and the value that the matcher compared.

The actual value is the one of [`getCSSProperty()`](https://webdriver.io/docs/api/element/getCSSProperty), which WebdriverIO normalizes: lowercase and trimmed, a color as `rgba(r,g,b,a)` with no spaces (not `white`, `#fff` or `rgb(255, 255, 255)`), and only the first font of `font-family`. A value without unit is a number, compared as its text: `font-weight: '700'`, `opacity: '0'`. Write the expected value in this form, or use `ignoreCase` for the case. As in `toHaveText`, `replace` applies first, then `ignoreCase` and the position option.

##### Usage

```js
// The <h1> of a page: color `rgb(255, 255, 255)`, font-family `"Helvetica Neue", Helvetica, Arial`
await expect($('h1')).toHaveStyle({
  'color': 'rgba(255,255,255,1)',
  'font-family': 'helvetica neue',
  'font-weight': '700',
  'font-size': '16px',
})
await expect($('h1')).toHaveStyle({ 'font-family': 'Helvetica Neue' }, { ignoreCase: true })
await expect($('h1')).toHaveStyle({
  'color': expect.oneOf('rgba(0,0,0,1)', 'rgba(255,255,255,1)'),
  'font-size': /^1[0-9]px$/,
})
```

### toHaveText

Checks if an element matches a specific text exactly. You can also pass an asymmetric matcher like `expect.stringContaining()` for partial matches, or use `expect.oneOf()` if the element can have different possible texts.

**Note:** An array of expected values is for multiple elements `$$()` only, one value per element. On a single element, it fails the assertion: use `expect.oneOf()`.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('.hero__subtitle')

// Exact match assertion
await expect(elem).toHaveText('Next-gen browser and mobile automation test framework for Node.js')

// Partial match assertion using stringContaining
await expect(elem).toHaveText(expect.stringContaining('test framework for Node.js'))

// Succeeds if one of the text options matches (v6.0.0+)
await expect(elem).toHaveText(expect.oneOf('Next-gen browser and mobile automation test framework for Node.js', 'Get Started'))
await expect(elem).toHaveText(expect.oneOf(expect.stringContaining('test framework for Node.js'), expect.stringContaining('Started')))
```

If you have a list of elements like the HTML structure below:

```
<ul>
  <li>Coffee</li>
  <li>Tea</li>
  <li>Milk</li>
</ul>
```

You can assert all of them at once using an array:

```js
// Index-based: each element must match the value at its index
await expect($$('ul > li')).toHaveText(['Coffee', 'Tea', 'Milk'])
```

Use `expect.arrayContaining()` to check for a subset of texts in any order. Extra elements are allowed. See [Matching a subset of element values](#matching-a-subset-of-element-values) for retry behavior, options, and other supported matchers.

```js
await expect($$('ul > li')).toHaveText(expect.arrayContaining(['Tea', 'Coffee']))
await expect($$('ul > li')).toHaveText(expect.arrayContaining([expect.stringContaining('Coff')]))
await expect($$('ul > li')).not.toHaveText(expect.arrayContaining(['Juice']))
```

### toHaveHTML

Checks if an element matches a specific text exactly. You can also pass an asymmetric matcher like `expect.stringContaining()` for partial matches, or use `expect.oneOf()` if the element can have different possible texts.

**Note:** An array of expected values is for multiple elements `$$()` only, one value per element. On a single element, it fails the assertion: use `expect.oneOf()`.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('.hero__subtitle')

await expect(elem).toHaveHTML('<p class="hero__subtitle">Next-gen browser and mobile automation test framework for Node.js</p>')
await expect(elem).toHaveHTML(expect.stringContaining('Next-gen browser and mobile automation test framework for Node.js'))
await expect(elem).toHaveHTML('Next-gen browser and mobile automation test framework for Node.js', { includeSelectorTag: false })
```

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('.hero__subtitle')

await expect(elem).toHaveHTML(expect.oneof('Next-gen browser and mobile automation test framework for Node.js', 'Get Started'), { includeSelectorTag: false })
await expect(elem).toHaveHTML(expect.oneof(expect.stringContaining('automation test framework for Node.js'), expect.stringContaining('Started')), { includeSelectorTag: false })
```

### toBeDisplayedInViewport

Checks if an element is within the viewport by calling [`isDisplayedInViewport`](https://webdriver.io/docs/api/element/isDisplayedInViewport) on the element.

##### Usage

```js
await expect($('#elem')).toBeDisplayedInViewport()
```

### toHaveChildren

Checks amount of the fetched element's children by calling `element.$('./*')` command.

##### Usage

```js
const list = await $('#selectbox')
await expect(list).toHaveChildren() // the list has at least one option
// same as
await expect(list).toHaveChildren({ gte: 1 })

await expect(list).toHaveChildren(3) // the list has 3 options
// same as
await expect(list).toHaveChildren({ eq: 3 })
```

### toHaveWidth

Checks if element has a specific width.

##### Usage

```js
await browser.url('http://github.com')
const logo = await $('[aria-label="Homepage"] .octicon-mark-github')
await expect(logo).toHaveWidth(32)
// Same as
await expect(logo).toHaveWidth({ eq: 32 })

// Greater/Less than equals or in between
await expect(logo).toHaveWidth({ gte: 32 })
await expect(logo).toHaveWidth({ lte: 34 })
await expect(logo).toHaveWidth({ gte: 32, lte: 34 })

// One of these widths, and nothing between
await expect(logo).toHaveWidth(expect.oneOf(32, 64))

// A width that the browser rounds
await expect(logo).toHaveWidth(expect.closeTo(32.4, 0))
```

### toHaveHeight

Checks if element has a specific height.

##### Usage

```js
await browser.url('http://github.com')
const logo = await $('[aria-label="Homepage"] .octicon-mark-github')
await expect(logo).toHaveHeight(32)
// Same as
await expect(logo).toHaveHeight({ eq: 32 })

// Greater/Less than equals or in between
await expect(logo).toHaveHeight({ gte: 32 })
await expect(logo).toHaveHeight({ lte: 34 })
await expect(logo).toHaveHeight({ gte: 32, lte: 34 })
```

### toHaveSize

Checks if element has a specific size, with [deep equality](#deep-equality). Each field is a [number matcher](#number-matcher) value: a number, a `NumberMatcher` (`{ gte: 30 }`), or `expect.oneOf()` with numbers. The size can also be an asymmetric matcher, e.g. `expect.objectContaining()` to check one field only. An invalid field value throws, as in `toHaveWidth`, e.g. `{}`, `gte` greater than `lte`, a string, `NaN` or a list matcher. A range is converted only in the fields of the size, not inside an asymmetric matcher: for one field with a range, write `{ width: { gte: 30 }, height: expect.any(Number) }`.

##### Usage

```js
await browser.url('http://github.com')
const logo = await $('[aria-label="Homepage"] .octicon-mark-github')
await expect(logo).toHaveSize({ width: 32, height: 32 })
await expect(logo).toHaveSize({ width: { gte: 30, lte: 34 }, height: expect.oneOf(32, 64) })
await expect(logo).toHaveSize(expect.objectContaining({ width: 32 }))
```

### toBeElementsArrayOfSize

Checks amount of fetched elements using [`$$`](https://webdriver.io/docs/api/element/$$) command.

**Note:** This matcher will update the passed array with the latest elements if the assertion passes. However, if you've reassigned the variable, you'll need to fetch the elements again.

##### Usage

```js
const listItems = await $$('.box')
await expect(listItems).toBeElementsArrayOfSize(5) // 5 boxes

// Greater/Less then
await expect(listItems).toBeElementsArrayOfSize({ lte: 10 })
// same as
assert.ok(listItems.length <= 10)

await expect(listItems).toBeElementsArrayOfSize({ gte: 5 })
// In between
await expect(listItems).toBeElementsArrayOfSize({ gte: 5, lte: 5 })
```

With [multi-remote](MultiRemote.md), the size is checked per browser instance. Pass a single size that every instance must match, or one size per instance (every instance must be listed):

```js
const listItems = await multiRemoteBrowser.$$('.box')
await expect(listItems).toBeElementsArrayOfSize(5) // 5 boxes in every browser
await expect(listItems).toBeElementsArrayOfSize(expect.multiRemote({ chrome: 5, firefox: { gte: 3 } }))
```

### Multiple Elements Support

All element matchers support arrays of elements returned from `$$()`:
- **Standard Behavior:** Every element must pass. One failure fails the assertion.
- **Using `.not`:** Every element must *not* meet the matcher condition. One match fails the assertion.
- **Empty Arrays:** Empty element arrays will fail the assertion by default. 
  - *Note:* Only the `toExist`, `toBeExisting`, and `toBePresent` matchers succeed when using `.not` on an empty element array.
- **Retry / Array Refresh:** On failure or stale references, the element array is automatically re-fetched until the matcher passes or times out.
- **Multi-remote:** The same rules apply per browser instance, each on its own elements, see [Multi-remote Support](MultiRemote.md#multiple-elements-).
- See [MultipleElements.md](MultipleElements.md) for more details.

#### Usage

##### `toBe` matchers

```ts
// Elements awaited selector syntax
const elements = await $$('#someElements')
await expect(elements).toBeDisplayed()

// Elements non-awaited
await expect($$('#someElements')).toBeDisplayed()

// Works with filtered elemnts array
await expect($$('#someElements').filter((t) => t.isExisting())).toBeDisplayed()

// Using the .not modifier (Asserts NO elements are displayed)
await expect($$('#someElements')).not.toBeDisplayed()
```

##### `toHave` matchers

```ts
const elements = await $$('#someElem')

// Single value: checked against every element
await expect(elements).toHaveAttribute('class', 'form-control')

// One of: checked against every element and succeed if one of the expected text matches
await expect(elements).toHaveAttribute('class', expect.oneOf('form-control1', 'form-control2'))

// Array: each value checked at corresponding element index (must match length)
await expect(elements).toHaveAttribute('class', ['control1', 'control2'])

// Use asymmetric matchers for flexible matching
await expect(elements).toHaveAttribute('class', [expect.stringContaining('control1'), 'control2'])

// Use RegEx `i` for case insensitive
await expect(elements).toHaveAttribute('class', [/Control1/i, 'control2'])

// Use RegEx with `|` to mimic contains
await expect(elements).toHaveAttribute('class', /Control1|Control2/)
await expect(elements).toHaveAttribute('class', [/Control1|Control2/, 'control3'])

// Elements non-awaited
await expect($$('#someElem')).toHaveAttribute('class', 'form-control')

// Works with filtered elements array too
await expect($$('#someElem').filter(el => el.isExisting())).toHaveAttribute('class', ['control1', 'control2'])
```

## Network Matchers

Network matchers also support the mocks of a multi-remote `mock()`, with one expected value for every browser instance or, with `expect.multiRemote()`, one per instance, see [Multi-remote Support](MultiRemote.md#network-matchers).

### toBeRequested

Checks that mock was called

##### Usage

```js
const mock = browser.mock('**/api/todo*')
await expect(mock).toBeRequested()
```

### toBeRequestedTimes

Checks that mock was called for the expected amount of times

##### Usage

```js
const mock = browser.mock('**/api/todo*')
await expect(mock).toBeRequestedTimes(2)
// same as
await expect(mock).toBeRequestedTimes({ eq: 2 })

// request called at least 5 times but less than 11
await expect(mock).toBeRequestedTimes({ gte: 5, lte: 10 }) 
```

### toBeRequestedWith

Checks that mock was called according to the expected options.

Most of the options supports expect/jasmine partial matchers like [expect.objectContaining](https://jestjs.io/docs/expect#expectobjectcontainingobject)

##### Usage

```js
const mock = browser.mock('**/api/todo*', { method: 'POST' })

await expect(mock).toBeRequestedWith({
    url: 'http://localhost:8080/api/todo',          // [optional] string | function | custom matcher
    method: 'POST',                                 // [optional] string | array
    statusCode: 200,                                // [optional] number | array
    requestHeaders: { Authorization: 'foo' },       // [optional] object | function | custom matcher
    responseHeaders: { Authorization: 'bar' },      // [optional] object | function | custom matcher
    postData: { title: 'foo', description: 'bar' }, // [optional] object | function | custom matcher
    response: { success: true },                    // [optional] object | function | custom matcher
})

await expect(mock).toBeRequestedWith({
    url: expect.stringMatching(/.*\/api\/.*/i),
    method: ['POST', 'PUT'], // either POST or PUT
    statusCode: [401, 403],  // either 401 or 403
    requestHeaders: headers => headers.Authorization.startsWith('Bearer '),
    postData: expect.objectContaining({ released: true, title: expect.stringContaining('foobar') }),
    response: r => Array.isArray(r) && r.data.items.length === 20
})
```

> **Note on `postData`/`response` timing:** unlike the other options, the request/response body is
> collected asynchronously (an extra round-trip after the request/response headers are already
> available), so it may not be attached to a call yet at the very first check. Regular assertions
> retry within their `wait` timeout and pick it up once it arrives. `.not.toBeRequestedWith({ postData
> / response })` also retries within `wait` - but only while there's a call that already matches every
> other criterion and is just waiting on its body to attach; if nothing matches at all (wrong URL, no
> call made, etc.) it still resolves immediately, same as any other `.not` assertion. The one residual
> case this can't close: if the body genuinely takes longer to arrive than your configured `wait`, a
> `.not` assertion can still report a false pass. If you rely on `.not` with `postData`/`response` and
> see intermittent false passes, increase `wait` (or await a signal that the request has fully
> completed) before asserting.

## Snapshot Matcher

WebdriverIO supports basic snapshot tests as well as DOM snapshot testing.

### toMatchSnapshot

Checks if any arbitrary object matches a certain value. If you pass in an [`WebdriverIO.Element`](https://webdriver.io/docs/api/element) it will automatically snapshot the [`outerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML) state of it.

##### Usage

```js
// snapshot arbitrary objects (no "await" needed here)
expect({ foo: 'bar' }).toMatchSnapshot()
// snapshot `outerHTML` of WebdriverIO.Element (DOM snapshot, requires "await")
await expect($('elem')).toMatchSnapshot()
// snapshot `outerHTML` of multi-remote elements, $() or $$(): shared by every instance, else keyed by instance name (requires "await")
await expect(multiRemoteBrowser.$('elem')).toMatchSnapshot()
await expect(multiRemoteBrowser.$$('.box')).toMatchSnapshot()
// snapshot `outerHTML` of every element of $$() as an array (requires "await")
await expect($$('.box')).toMatchSnapshot()
// snapshot result of element command
await expect($('elem').getCSSProperty('background-color')).toMatchSnapshot()
```

### toMatchInlineSnapshot

Similarly, you can use the `toMatchInlineSnapshot()` to store the snapshot inline within the test file. For example, given:

```js
await expect($('#secondPageLink')).toMatchInlineSnapshot()
```

Instead of creating a snapshot file, WebdriverIO will modify the test file directly to update the snapshot as a string:

```js
await expect($('#secondPageLink')).toMatchInlineSnapshot(`"<a href="./two.html" id="secondPageLink">two</a>"`)
```

With `$$()`, the snapshot is the `outerHTML` of every element as an array:

```js
await expect($$('header a')).toMatchInlineSnapshot(`
  [
    "<a href="pointer.html">3</a>",
    "<a href="gestureTest.html">2</a>",
    "<a href="index.html">1</a>",
  ]
`)
```

## Visual Snapshot Matchers

<!--
    These matchers aren't implemented in the `expect-webdriverio` project and can be found
    here: https://github.com/webdriverio-community/visual-testing/blob/e10f7005c1533f5b06811888a9cbb9020e6e765e/packages/service/src/matcher.ts
-->

The following matcher are implemented as part of the `@wdio/visual-service` plugin and only available when the service is set up. Make sure you follow the [set-up instructions](https://webdriver.io/docs/visual-testing) accordingly.

### toMatchElementSnapshot

Checks that if given element matches with snapshot of baseline.

##### Usage

```js
await expect($('#purplebox')).toMatchElementSnapshot('purpleBox', 0, {
    // options
})
```

The expected result is by default `0`, so you can write the same assertion as:

```js
await expect($('#purplebox')).toMatchElementSnapshot('purpleBox', {
    // options
})
```

or not pass in any options at all:

```js
await expect($('#purplebox')).toMatchElementSnapshot()
```

### toMatchScreenSnapshot

Checks that if current screen matches with snapshot of baseline.

##### Usage

```js
await expect(browser).toMatchScreenSnapshot('partialPage', 0, {
    // options
})
```

The expected result is by default `0`, so you can write the same assertion as:

```js
await expect(browser).toMatchScreenSnapshot('partialPage', {
    // options
})
```

or not pass in any options at all:

```js
await expect(browser).toMatchScreenSnapshot('partialPage')
```

### toMatchFullPageSnapshot

Checks that if the full page screenshot matches with snapshot of baseline.

##### Usage

```js
await expect(browser).toMatchFullPageSnapshot('fullPage', 0, {
    // options
})
```

The expected result is by default `0`, so you can write the same assertion as:

```js
await expect(browser).toMatchFullPageSnapshot('fullPage', {
    // options
})
```

or not pass in any options at all:

```js
await expect(browser).toMatchFullPageSnapshot('fullPage')
```

### toMatchTabbablePageSnapshot

Checks that if the full page screenshot including tab marks matches with snapshot of baseline.

##### Usage

```js
await expect(browser).toMatchTabbablePageSnapshot('tabbable', 0, {
    // options
})
```

The expected result is by default `0`, so you can write the same assertion as:

```js
await expect(browser).toMatchTabbablePageSnapshot('tabbable', {
    // options
})
```

or not pass in any options at all:

```js
await expect(browser).toMatchTabbablePageSnapshot('tabbable')
```

## Using regular expressions

You can also directly use regular expressions for all matchers that do text comparison.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('.hero__subtitle')
await expect(elem).toHaveText(/node\.js/i)
await expect(elem).toHaveText(expect.oneOf(/node\.js/i, 'Get Started'))
await expect(browser).toHaveTitle(/webdriverio/i)
await expect(browser).toHaveUrl(/webdriver\.io/)
await expect(elem).toHaveElementClass(/Hero__Subtitle/i)
```

## Default Matchers

In addition to the WebdriverIO matchers, `expect-webdriverio` also provides basic matchers from Jest's [expect](https://jestjs.io/docs/expect) library.

```ts
// Equality
expect(2 + 2).toBe(4);
expect({a: 1}).toEqual({a: 1});
expect([1, 2, 3]).toStrictEqual([1, 2, 3]);
expect(2 + 2).not.toBe(5);

// Truthiness
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect(0).toBeFalsy();
expect(1).toBeTruthy();
expect(NaN).toBeNaN();

// Numbers
expect(4).toBeGreaterThan(3);
expect(4).toBeGreaterThanOrEqual(4);
expect(4).toBeLessThan(5);
expect(4).toBeLessThanOrEqual(4);
expect(0.2 + 0.1).toBeCloseTo(0.3, 5);

// Strings
expect('team').toMatch(/team/);
expect('Christoph').toContain('stop');

// Arrays and iterables
expect([1, 2, 3]).toContain(2);
expect([{a: 1}, {b: 2}]).toContainEqual({a: 1});
expect([1, 2, 3]).toHaveLength(3);

// Objects
expect({a: 1, b: 2}).toHaveProperty('a');
expect({a: {b: 2}}).toHaveProperty('a.b', 2);

// Errors
expect(() => { throw new Error('error!') }).toThrow('error!');
expect(() => { throw new TypeError('wrong type') }).toThrow(TypeError);

// Asymmetric matchers
expect({foo: 'bar', baz: 1}).toEqual(expect.objectContaining({foo: expect.any(String)}));
expect([1, 2, 3]).toEqual(expect.arrayContaining([2]));
expect('abc').toEqual(expect.stringContaining('b'));
expect('abc').toEqual(expect.stringMatching(/b/));
expect(123).toEqual(expect.any(Number));

// Others
expect(new Set([1, 2, 3])).toContain(2);

// .resolves / .rejects (async)
await expect(Promise.resolve(42)).resolves.toBe(42);
await expect(Promise.reject(new Error('fail'))).rejects.toThrow('fail');
```    

### Jasmine

For Jasmine, see the official documentation for [expect/expectAsync](https://jasmine.github.io/api/edge/global.html#expect), [matchers](https://jasmine.github.io/tutorials/your_first_suite#section-Matchers), and [async-matchers](https://jasmine.github.io/api/edge/async-matchers.html).

**Note:**
- With the global `expect` of `@wdio/jasmine-framework`, the Jasmine synchronous matchers stay synchronous. The WebdriverIO matchers and the Jasmine async matchers return a promise. See [Jasmine](Framework.md#jasmine).
- Default matchers are still available if you import `expect` directly from `expect-webdriverio` instead of using the global.

## Modifiers

### .not
WebdriverIO supports usage of modifiers as `.not` and it will wait until the reverse condition is meet

```ts
// Wait until the element is no longer present
await expect($('element')).not.toBeDisplayed()

// Wait until the text is no more 'some title'
await expect(browser).not.toHaveTitle('some title')
```

In case immediate assertion is required, use `{ wait: 0 }`
```ts
// Ensure element is not present right now
await expect($('element')).not.toBeDisplayed({ wait: 0 })

// Ensure the text is not 'some title' right now
await expect(browser).not.toHaveTitle('some title', { wait: 0 })
```

**Note:** You can pair `.not` with asymmetric matchers, but to enable the wait-until behavior, `.not` must be used directly on the `expect()` call. 

### some()

since: v6.0.0

The custom `some()` function (distinct syntax compared to `.not`) allows you to assert that at least one element from multiple elements meets the assertion.

```ts
import { some } from 'expect-webdriverio/api'

// Allow to succeed only if one element matches (or not match)
// Succeeds if at least one element matches either 'optionA' or 'optionB'
await expect(some($$('elements'))).toHaveText(expect.oneOf('optionA', 'optionB'));
// Succeeds if at least one element does not matches either 'forbiddenTextA' or 'forbiddenTextB'
await expect(some($$('elements'))).not.toHaveText(/forbiddenTextA|forbiddenTextB/);
// Succeeds if the first element matches 'valueForIndex0' OR the second matches 'valueForIndex1'
await expect(some($$('elements'))).toHaveText(['valueForIndex0', 'valueForIndex1']);
```

**Note**: With [multi-remote](MultiRemote.md), `some()` requires at least one matching element in **every** browser instance.

## Asymmetric Matchers

WebdriverIO supports usage of asymmetric matchers wherever you compare text values, e.g.:

```ts
await expect(browser).toHaveTitle(expect.stringContaining('some title'))
```

or

```ts
await expect(browser).toHaveTitle(expect.not.stringContaining('some title'))
```

### expect.multiRemote()

With [multi-remote](MultiRemote.md), passes one expected value per browser instance, keyed by instance name. Every instance must be listed.

```ts
await expect(multiRemoteBrowser).toHaveTitle(expect.multiRemote({ chrome: 'WebdriverJS Testpage', firefox: expect.stringContaining('Testpage') }))
await expect(multiRemoteBrowser.$('header h1')).toHaveStyle(expect.multiRemote({ chrome: { color: 'red' }, firefox: { color: 'blue' } }))
```

See [Expected Values](MultiRemote.md#expected-values) for the plain object shorthand.

### Jasmine

Under `@wdio/jasmine-framework`, some Jasmine asymmetric matchers now work with WebdriverIO matchers and the global import.

```ts
// Jasmine's stringContaining works just like the one from expect
await expect(browser).toHaveTitle(jasmine.stringContaining('some title'))
await expect(browser).toHaveTitle(expect.stringContaining('some title'))

// Jasmine's stringMatching works
await expect(browser).toHaveUrl(jasmine.stringMatching('/WebdriverIO/'))

// Jasmine's any & anything works
await expect(browser).toHaveUrl(jasmine.any(String))
await expect(browser).toHaveUrl(jasmine.anything())

// Jasmine's objectContaining works with Network Matchers
await expect(mock).toBeRequestedWith({
    method: 'POST',
    requestHeaders: expect.objectContaining({
        Authorization: 'foo'
    }),
})

// Jasmine's any & anything works with Network Matchers
await expect(mock).toBeRequestedWith({
    method: 'POST',
    url: jasmine.any(String),
    requestHeaders: jasmine.anything(),
})
```

`jasmine.arrayContaining()` and `jasmine.arrayWithExactContents()` are also supported for [element collection values](#matching-a-subset-of-element-values), including nested Jasmine matchers. Limitations with Jasmine collection and object matchers may still apply in other assertion contexts.
