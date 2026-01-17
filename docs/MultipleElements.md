# Multiple Elements Support

Matchers element array support (e.g., `$$()`):

- **Strict Index-based Matching**: If an array of expected values is provided, it must match the elements' count; each value is checked at its index.
- If a single value is provided, every element is compared to it.
- Asymmetric matchers (e.g., `expect.stringContaining`) work within expected value arrays.
- An error is thrown if no elements are found (except with `toBeElementsArrayOfSize`).
- Options like `StringOptions` or `HTMLOptions` apply to the whole array; `NumberOptions` behaves like any expected provided value.
- The assertion passes only if **all** elements match.
- Using `.not` means all elements must **not** match.

**Note:** Strict Index-based matching does not apply to `toHaveText`, since an existing behavior was already in placed.

## Limitations
- Instead of `StringOptions` for a single expected value, use RegExp or asymmetric matchers.
  - For `ignoreCase` use RegEx (`/MyExample/i`) 
  - For `containing` use Asymmetric Matchers (`expect.stringContaining('Example')`)
- Passing an array of "containing" values is deprecated and not supported outside `toHaveText`.

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
            it("Element at $index of `$$('label')` is $expectedText", function () {
                expect($$('label')[index]).toHaveText(expectedText);
            });
        });
    });
```    
