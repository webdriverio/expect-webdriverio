# MultiRemote Support (Alpha)

Multi-remote support is in active development.

## Usage

By default, multi-remote queries (e.g., `getTitle`) fetch data from all remotes, simplifying tests where browsers share behavior.

Use the typed global constants:
```ts
import { multiremotebrowser } from '@wdio/globals' 
...
await expect(multiRemoteBrowser).toXX()
```
Note: `multiRemoteBrowser` is used in examples pending a planned rename.


Assuming the below multi-remote Wdio configuration:
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
- Assertions currently throw on the first error. Future updates will report errors as failures.
