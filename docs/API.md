# API

When you're writing tests, you often need to check that values meet certain conditions. `expect` gives you access to a number of "matchers" that let you validate different things on the `browser`, an `element` or `mock` object.

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
import { setOptions } from 'expect-webdriverio'

export const config = {
    // ...
    before () {
        setOptions({ wait: 5000 })
    },
    // ...
}
```

### Matcher Options

Every matcher can take several options that allows you to modify the assertion:

##### Command Options

| Name | Type | Details |
| ---- | ---- | ------- |
| <code><var>wait</var></code> | number | time in ms to wait for expectation to succeed. Default: `3000` |
| <code><var>interval</var></code> | number | interval between attempts. Default: `100` |
| <code><var>message</var></code> | string | user message to prepend before assertion error |

##### String Options

This option can be applied in addition to the command options when strings are being asserted. 

| Name | Type | Details |
| ---- | ---- | ------- |
| <code><var>ignoreCase</var></code> | boolean | apply `toLowerCase` to both actual and expected values |
| <code><var>trim</var></code> | boolean | apply `trim` to actual value |
| <code><var>replace</var></code> Replacer | Replacer[] | replace parts of the actual value that match the string/RegExp. The replacer can be a string or a function.
| <code><var>containing</var></code> | boolean | expect actual value to contain expected value, otherwise strict equal. |
| <code><var>asString</var></code> | boolean | might be helpful to force converting property value to string |
| <code><var>atStart</var></code> | boolean | expect actual value to start with the expected value |
| <code><var>atEnd</var></code> | boolean | expect actual value to end with the expected value |
| <code><var>atIndex</var></code> | number | expect actual value to have the expected value at the given index |

##### Number Options

This option can be applied in addition to the command options when numbers are being asserted.

| Name | Type | Details |
| ---- | ---- | ------- |
| <code><var>eq</var></code> | number | equals |
| <code><var>lte</var></code> | number | less then equals |
| <code><var>gte</var></code> | number | greater than or equals |

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

### toHaveUrl

Checks if browser is on a specific page.

##### Usage

```js
await browser.url('https://webdriver.io/')
await expect(browser).toHaveUrl('https://webdriver.io')
```

### toHaveUrlContaining

Checks if browser is on a page URL that contains a value.

##### Usage

```js
await browser.url('https://webdriver.io/')
await expect(browser).toHaveUrlContaining('webdriver')
```

### toHaveTitle

Checks if website has a specific title.

##### Usage

```js
await browser.url('https://webdriver.io/')
await expect(browser).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js')
```

### toHaveTitleContaining

Checks if website has a specific title that contains a value.

##### Usage

```js
await browser.url('https://webdriver.io/')
await expect(browser).toHaveTitleContaining('WebdriverIO')
```

## Element Matchers

### toBeDisplayed

Calls [`isDisplayed`](https://webdriver.io/docs/api/element/isDisplayed/) on given element.

##### Usage

```js
const elem = await $('#someElem')
await expect(elem).toBeDisplayed()
```

### toExist

Calls [`isExisting`](https://webdriver.io/docs/api/element/isExisting) on given element.

##### Usage

```js
const elem = await $('#someElem')
await expect(elem).toExist()
```

### toBePresent

Same as `toExist`.

##### Usage

```js
const elem = await $('#someElem')
await expect(elem).toBePresent()
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
const myInput = await $('input')
await expect(myInput).toHaveAttribute('class', 'form-control')
```

### toHaveAttr

Same as `toHaveAttribute`.

##### Usage

```js
const myInput = await $('input')
await expect(myInput).toHaveAttr('class', 'form-control')
```

### toHaveAttributeContaining

Checks if an element has a certain attribute that contains a value.

##### Usage

```js
const myInput = await $('input')
await expect(myInput).toHaveAttributeContaining('class', 'form')
```

### toHaveAttrContaining

Same as `toHaveAttributeContaining`.

##### Usage

```js
const myInput = await $('input')
await expect(myInput).toHaveAttrContaining('class', 'form')
```

### toHaveElementClass

Checks if an element has a certain class name.

##### Usage

```js
const myInput = await $('input')
await expect(myInput).toHaveElementClass('form-control', { message: 'Not a form control!', })
```

### toHaveElementClassContaining

Checks if an element has a certain class name that contains provided value.

##### Usage

```js
const myInput = await $('input')
await expect(myInput).toHaveElementClassContaining('form')
```

### toHaveElementProperty

Checks if an element has a certain property.

##### Usage

```js
const elem = await $('#elem')
await expect(elem).toHaveElementProperty('height', 23)
await expect(elem).not.toHaveElementProperty('height', 0)
```

### toHaveValue

Checks if an input element has a certain value.

##### Usage

```js
const myInput = await $('input')
await expect(myInput).toHaveValue('user', { ignoreCase: true })
```

### toHaveValueContaining

Checks if an input element contains a certain value.

##### Usage

```js
const myInput = await $('input')
await expect(myInput).toHaveValueContaining('us')
```

### toBeClickable

Checks if an element can be clicked by calling [`isClickable`](https://webdriver.io/docs/api/element/isClickable) on the element.

##### Usage

```js
const elem = await $('#elem')
await expect(elem).toBeClickable()
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
const elem = await $('#elem')
await expect(elem).toBeSelected()
```

### toBeChecked

Same as `toBeSelected`.

##### Usage

```js
const elem = await $('#elem')
await expect(elem).toBeChecked()
```

### toHaveComputedLabel

Checks if element has a specific computed WAI-ARIA label. Can also be called with an array as parameter in the case where the element can have different labels.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('a[href="https://github.com/webdriverio/webdriverio"]')
await expect(elem).toHaveComputedLabel('GitHub repository')
await expect(elem).toHaveComputedLabel(['GitHub repository', 'Private repository'])
```

### toHaveComputedLabelContaining

Checks if element contains a specific computed WAI-ARIA label. Can also be called with an array as parameter in the case where the element can have different labels.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('a[href="https://github.com/webdriverio/webdriverio"]')
await expect(elem).toHaveComputedLabelContaining('GitHub')
await expect(elem).toHaveComputedLabelContaining(['GitHub', 'Private'])
```

### toHaveComputedRole

Checks if element has a specific computed WAI-ARIA role. Can also be called with an array as parameter in the case where the element can have different labels.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('[aria-label="Skip to main content"]')
await expect(elem).toHaveComputedRole('region')
await expect(elem).toHaveComputedRole(['region', 'section'])
```

### toHaveComputedRoleContaining

Checks if element contains a specific computed WAI-ARIA role. Can also be called with an array as parameter in the case where the element can have different roles.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('[aria-label="Skip to main content"]')
await expect(elem).toHaveComputedRoleContaining('reg')
await expect(elem).toHaveComputedRoleContaining(['reg', 'sec'])
```

### toHaveHref

Checks if link element has a specific link target.

##### Usage

```js
const link = await $('a')
await expect(link).toHaveHref('https://webdriver.io')
```

### toHaveLink

Same as `toHaveHref`.

##### Usage

```js
const link = await $('a')
await expect(link).toHaveLink('https://webdriver.io')
```

### toHaveHrefContaining

Checks if link element contains a specific link target.

##### Usage

```js
const link = await $('a')
await expect(link).toHaveHrefContaining('webdriver.io')
```

### toHaveLinkContaining

Same as `toHaveHrefContaining`.

##### Usage

```js
const link = await $('a')
await expect(link).toHaveLinkContaining('webdriver.io')
```

### toHaveId

Checks if element has a specific `id` attribute.

##### Usage

```js
const elem = await $('#elem')
await expect(elem).toHaveId('elem')
```

### toHaveText

Checks if element has a specific text. Can also be called with an array as parameter in the case where the element can have different texts.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('.container')
await expect(elem).toHaveText('Next-gen browser and mobile automation test framework for Node.js')
await expect(elem).toHaveText(['Next-gen browser and mobile automation test framework for Node.js', 'Get Started'])
```

### toHaveTextContaining

Checks if element contains a specific text. Can also be called with an array as parameter in the case where the element can have different texts.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('.container')
await expect(elem).toHaveTextContaining('browser and mobile automation test framework')
await expect(elem).toHaveTextContaining(['browser and mobile automation test framework', 'Started'])
```

### toHaveHTML

Checks if element has a specific text. Can also be called with an array as parameter in the case where the element can have different texts.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('.hero__subtitle')
await expect(elem).toHaveHTML('<p class="hero__subtitle">Next-gen browser and mobile automation test framework for Node.js</p>')
await expect(elem).toHaveHTML('Next-gen browser and mobile automation test framework for Node.js', { includeSelectorTag: false })
await expect(elem).toHaveHTML(['Next-gen browser and mobile automation test framework for Node.js', 'Get Started'], { includeSelectorTag: false })
```

### toHaveHTMLContaining

Checks if element contains a specific text. Can also be called with an array as parameter in the case where the element can have different texts.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('.hero__subtitle')
await expect(elem).toHaveHTMLContaining('Next-gen browser')
await expect(elem).toHaveHTMLContaining('Next-gen browser', { includeSelectorTag: false })
await expect(elem).toHaveHTMLContaining(['Next-gen browser', 'Get Started'], { includeSelectorTag: false })
```

### toBeDisplayedInViewport

Checks if an element is within the viewport by calling [`isDisplayedInViewport`](https://webdriver.io/docs/api/element/isDisplayedInViewport) on the element.

##### Usage

```js
const elem = await $('#elem')
await expect(elem).toBeDisplayedInViewport()
```

### toHaveChildren

Checks amount of the fetched element's children by calling `element.$('./*')` command.

##### Usage

```js
const list = await $('ul')
await expect(list).toHaveChildren() // the list has at least one item
// same as
await expect(list).toHaveChildren({ gte: 1 })

await expect(list).toHaveChildren(3) // the list has 3 items
// same as 
await expect(list).toHaveChildren({ eq: 3 })
```

### toHaveWidth

Checks if element has a specific width.

##### Usage

```js
await browser.url('http://github.com')
const logo = await $('.octicon-mark-github')
await expect(logo).toHaveWidth(32)
```

### toHaveHeight

Checks if element has a specific height.

##### Usage

```js
await browser.url('http://github.com')
const logo = await $('.octicon-mark-github')
await expect(logo).toHaveHeight(32)
```

### toHaveSize

Checks if element has a specific size.

##### Usage

```js
await browser.url('http://github.com')
const logo = await $('.octicon-mark-github')
await expect(logo).toHaveSize({ width: 32, height: 32 })
```

### toBeElementsArrayOfSize

Checks amount of fetched elements using [`$$`](https://webdriver.io/docs/api/element/$$) command.

##### Usage

```js
const listItems = await $$('ul>li')
await expect(listItems).toBeElementsArrayOfSize(5) // 5 items in the list

await expect(listItems).toBeElementsArrayOfSize({ lte: 10 })
// same as
assert.ok(listItems.length <= 10)
```

## Network Matchers

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
await expect(mock).toBeRequestedTimes(2) // await expect(mock).toBeRequestedTimes({ eq: 2 })

await expect(mock).toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11
```

### toBeRequestedWith

Checks that mock was called according to the expected options.

Most of the options supports expect/jasmine partial matchers like [expect.objectContaining](https://jestjs.io/docs/en/expect#expectobjectcontainingobject)

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

## Using regular expressions

You can also directly use regular expressions for all matchers that do text comparison.

##### Usage

```js
await browser.url('https://webdriver.io/')
const elem = await $('.container')
await expect(elem).toHaveText(/node\.js/i)
await expect(elem).toHaveText([/node\.js/i, 'Get Started'])
await expect(elem).toHaveTextContaining([/node\.js/i, 'Started'])
await expect(browser).toHaveTitle(/webdriverio/i)
await expect(browser).toHaveUrl(/webdriver\.io/)
await expect(elem).toHaveElementClass(/Container/i)
```

## Default Matchers

In addition to the `expect-webdriverio` matchers you can use builtin Jest's [expect](https://jestjs.io/docs/en/expect) assertions or [expect/expectAsync](https://jasmine.github.io/api/3.5/global.html#expect) for Jasmine.
