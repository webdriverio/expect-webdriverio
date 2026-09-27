# Multiple Elements Support

Matchers support an element array returned from `$$()`:

- **Strict Index-based Matching**: If an array of expected values is provided, it must match the elements' count; each value is checked at its index.
- If a single value is provided, every element is compared to it.
- Asymmetric matchers (e.g., `expect.stringContaining`) work within expected value arrays.
- Assertion fails if no elements are found, except with `toBeElementsArrayOfSize` and existing matchers `toExist`, `toBeExisting` and `toBePresent`.
- Options like `StringOptions` or `HTMLOptions` apply to the whole array; `NumberMatcher` behaves like any expected provided value.
- The assertion passes only if **all** elements match.
- Using `.not` means all elements must **not** match.
- On failures, the element array is automatically re-fetched until the matcher passes or times out, ensuring reliability against dynamic DOM changes.

## Limitations

- Instead of `StringOptions` for a single expected value, use RegExp or asymmetric matchers.
  - For `ignoreCase` use RegEx (`/MyExample/i`) 
  - For `containing` use Asymmetric Matchers (`expect.stringContaining('Example')`)

### Browser Runner

The Browser Runner uses standard `expect`, only extended with the `expect-webdriverio` matchers: use `expect.oneOf` and `expect.some` there, see [Browser Runner](Framework.md#oneof--some). Multi-remote is not supported, see [Multiple Elements & Multi-remote](Framework.md#multiple-elements--multi-remote).

## Supported types

You can pass any of these element types to `expect`:
- `ChainablePromiseArray` (the non-awaited case)
- `ElementArray` (the awaited case)
- `Element[]` (the filtered case)
- `MultiRemoteElement[]` (multi-remote `$$()`), where these rules apply per browser instance, see [Multi-remote Support](MultiRemote.md#multiple-elements-)

## Choosing the expected value

Results of `toHaveText` on `$$('li')` for three lists:

| Expected value | Passes when | `Coffee`, `Tea` | `Tea`, `Tea` | `Coffee`, `Tea`, `Milk` |
| --- | --- | --- | --- | --- |
| `'Tea'` | every element has this text | fails | passes | fails |
| `['Coffee', 'Tea']` | same count, each element has the text at its index | passes | fails | fails |
| `expect.oneOf('Tea', 'Coffee')` | each element has one of the texts; a text can be missing | passes | passes | fails |
| `expect.arrayContaining(['Tea', 'Coffee'])` | each text is on at least one element; elements with other texts are allowed | passes | fails | passes |
| `some(elements)` with `'Tea'` | at least one element has the text | passes | passes | passes |

## Alternative

For more granular or explicit per-element validation, use a parameterized test of your framework.
Example in Mocha:
```ts
    describe('Element at index of `$$`', function () {
        [ { expectedText: 'one', index: 0 },
            { expectedText: 'two', index: 2 },
            { expectedText: 'four', index: 4 },
        ].forEach(function ( { expectedText, index } ) {
            it(`Element at ${index} of `$$('label')` have text "${expectedText}"`, function () {
                await expect($$('label')[index]).toHaveText(expectedText);
            });
        });
    });
```    


## Example

```ts
import { some } from 'expect-webdriverio/api'

const elements = $$('myElements')

// Single expected value
// Every element in the list must match this exact text.
await expect(elements).toHaveText('myValue1');
// Every element in the list must match either option.
await expect(elements).toHaveText(/optionA|optionB/);
// NOT Equivalent to:
await expect(elements).toHaveText(['optionA', 'optionB']);
// but equivalent to 
await expect(elements).toHaveText(expect.oneOf('optionA', 'optionB'));

// Multiple expected values
// Elements must match index-by-index: element 0 must be 'valueForIndex0' AND element 1 must be 'valueForIndex1'.
await expect(elements).toHaveText(['valueForIndex0', 'valueForIndex1']);

// Element at index 0 must match either `index0OptionA` or `index0OptionB` AND element 1 must match the exact string `index1OptionC`.
await expect(elements).toHaveText([
  /index0OptionA|index0OptionB/, 
  'index1OptionC'
]);
// Equivalent as
await expect(elements).toHaveText([
  expect.oneOf('index0OptionA','index0OptionB'), 
  'index1OptionC'
]);

// Negation with `.not`
// Every element in the list must NOT match the regex pattern.
await expect(elements).not.toHaveText(/forbiddenTextA|forbiddenTextB/);

// Allow to succeed only if one element matches (or not match)
// Succeeds if at least one element matches either 'optionA' or 'optionB'
await expect(some(elements)).toHaveText(expect.oneOf('optionA', 'optionB'));
// Succeeds if at least one element does not matches either 'forbiddenTextA' or 'forbiddenTextB'
await expect(some(elements)).not.toHaveText(/forbiddenTextA|forbiddenTextB/);
// Succeeds if the first element matches 'valueForIndex0' OR the second matches 'valueForIndex1'
await expect(some(elements)).toHaveText(['valueForIndex0', 'valueForIndex1']);
```
