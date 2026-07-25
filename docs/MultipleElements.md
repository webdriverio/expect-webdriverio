# Multiple Elements Support

Matchers support an element array returned from `$$()`:

- **Strict Index-based Matching**: If an array of expected values is provided, it must match the elements' count; each value is checked at its index.
- If a single value is provided, every element is compared to it.
- Asymmetric matchers (e.g., `expect.stringContaining`) work within expected value arrays.
- Assertion fails if no elements are found, except with `toBeElementsArrayOfSize` and existing matchers `toExist`, `toBeExisting` and `toBePresent`.
- Options like `StringOptions` or `HTMLOptions` apply to the whole array; `NumberMatcher` behaves like any expected provided value.
- The assertion passes only if **all** elements match.
- Using `.not` means all elements must **not** match.

**Note:** To apply strict index-based matching to the `toHaveText` matcher, `useToHaveTextStrictMultiElementsCompareStrategy` must be enabled. Else legacy behavior applies.

```ts
// On the matcher directly
expect($$('elements')).toHaveText(['text1','text2'], { featureFlags: { useToHaveTextStrictMultiElementsCompareStrategy : true } })

// Before hook
before(() => {
    setFeatureFlags({ useToHaveTextStrictMultiElementsCompareStrategy : true })
})

// Globally in wdio.conf file
before: function (_capabilities, _specs) {
    setFeatureFlags({ useToHaveTextStrictMultiElementsCompareStrategy : true })
}
```

## Limitations

- Instead of `StringOptions` for a single expected value, use RegExp or asymmetric matchers.
  - For `ignoreCase` use RegEx (`/MyExample/i`) 
  - For `containing` use Asymmetric Matchers (`expect.stringContaining('Example')`)
- Passing an array of "containing" values is a legacy behavior and only used by default with `toHaveText` when `useToHaveTextStrictMultiElementsCompareStrategy` is disabled.

## Supported types

You can pass any of these element types to `expect`:
- `ChainablePromiseArray` (the non-awaited case)
- `ElementArray` (the awaited case)
- `Element[]` (the filtered case)

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

`useToHaveTextStrictMultiElementsCompareStrategy` is assumed to be enabled

```ts
const elements = $$('myElements')

// Single expected value
// Every element in the list must match this exact text.
await expect(elements).toHaveText('myValue1');
// Every element in the list must match either option.
await expect(elements).toHaveText(/optionA|optionB/);
// NOT Equivalent to:
await expect(elements).toHaveText(['optionA', 'optionB']);

// Multiple expected values
// Elements must match index-by-index: element 0 must be 'valueForIndex0' AND element 1 must be 'valueForIndex1'.
await expect(elements).toHaveText(['valueForIndex0', 'valueForIndex1']);

// Element at index 0 must match either `index0OptionA` or `index0OptionB` AND element 1 must match the exact string `index1OptionC`.
await expect(elements).toHaveText([
  /index0OptionA|index0OptionB/, 
  'index1OptionC'
]);

// Negation with `.not`
// Every element in the list must NOT match the regex pattern.
await expect(elements).not.toHaveText(/forbiddenTextA|forbiddenTextB/);
```

## COMING SOON

```ts
// To allow passing if at least one element matches, we can introduce a `.some` modifier.
await expect(elements).some.toHaveText('myValue1');
await expect(elements).some.toBeDisplayed();

// Use oneOf to ease passing multiple values
await expect(elements).toHaveText(/optionA|optionB/);
// Equivalent to:
await expect(elements).toHaveText(oneOf('optionA', 'optionB'));
// Element 0 must match oneOf the value AND Element 1 must match the exact string.
await expect(elements).toHaveText([
  oneOf('index0OptionA','index0OptionB'), 
  'index1OptionC'
]);
```
