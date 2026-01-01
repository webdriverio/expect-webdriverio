# MultiRemote Support (Alpha)

Multi-remote support is in active development.

## Usage

By default, multi-remote queries (e.g., `getTitle`) fetch data from all remotes, simplifying tests where browsers share behavior.

Use the typed global constants:
```ts
import { multiremotebrowser as multiRemoteBrowser } from '@wdio/globals' 
...
await expect(multiRemoteBrowser).toHaveTitle('...')
```
Note: `multiRemoteBrowser` is used in examples pending a planned rename.


Assuming the following WebdriverIO multi-remote configuration:
```ts
export const config: WebdriverIO.MultiremoteConfig = {
    ...
    capabilities: {
        myChromeBrowser: {
            capabilities: {
                browserName: 'chrome',
                'goog:chromeOptions': { args: ['--headless'] }
            }
        },
        myFirefoxBrowser: {
            capabilities: {
                browserName: 'firefox',
                'moz:firefoxOptions': { args: ['-headless'] }
            }
        } 
    },
    ...
}
```

## Single Expected Value
To test all remotes against the same value, pass a single expected value.
```ts
    await expect(multiRemoteBrowser).toHaveTitle('My Site Title')
```

## Multiple Expected Values
For differing remotes, pass an array of expected values.
  - Note: Values must match the configuration order.
```ts
    await expect(multiRemoteBrowser).toHaveTitle(['My Chrome Site Title', 'My Firefox Site Title'])
```

## **NOT IMPLEMENTED** Per Remote Expected Value
To test specific remotes, map instance names to expected values.

```ts
    // Test both defined remotes with specific values
    await expect(multiRemoteBrowser).toHaveTitle({
        'myChromeBrowser' : 'My Chrome Site Title', 
        'myFirefoxBrowser' : 'My Firefox Site Title'
    })
```

To assert a single remote and skip others:
```ts
    await expect(multiRemoteBrowser).toHaveTitle({
        'myFirefoxBrowser' : 'My Firefox Site Title'
    })
```

To assert all remotes with a default value, overriding specific ones:
```ts
    await expect(multiRemoteBrowser).toHaveTitle({
        default : 'My Default Site Title',
        'myFirefoxBrowser' : 'My Firefox Site Title'
    })
```

## Limitations
- Options (e.g., `StringOptions`) apply globally.
- Alpha support is limited to the `toHaveTitle` browser matcher.
- Element matchers are planned.
- Assertions currently throw on the first error. Future updates will report thrown errors as failures and if all remotes are in error it will throw.
- SoftAssertions, snapshot services and network matchers might come after.

## Alternatives

Since multi-remote instances are standard browsers, you can also assert by iterating over the instance list.

### Parameterized Tests
Using the parameterized feature of your test framework, you can iterate over the multi-remote instances.

Mocha Parameterized Example
```ts
    describe('Multiremote test', async () => {
        multiRemoteBrowser.instances.forEach(function (instance) {
            describe(`Test ${instance}`, function () {
                it('should have title "The Internet"', async function () {
                    const browser = multiRemoteBrowser.getInstance(instance)
                    await browser.url('https://mysite.com')
                    
                    await expect(browser).toHaveTitle("The Internet")
                })
            })
        })
    })
```
### Direct Instance Access
By extending the WebdriverIO `namespace` in TypeScript (see [documentation](https://webdriver.io/docs/multiremote/#extending-typescript-types)), you can directly access each instance and use `expect` on them.

```ts
    it('should have title per browsers', async () => {
        await multiRemoteBrowser.url('https://mysite.com')

        await expect(multiRemoteBrowser.myChromeBrowser).toHaveTitle('The Internet')
        await expect(multiRemoteBrowser.myFirefoxBrowser).toHaveTitle('The Internet')
    }) 
```

