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


# DRAFT

```ts
const element = $('myElement')
// === 1. SINGLE ELEMENT ===
// Case A: Single element, single exact value
await expect(element).toHaveText('myValue1'); 

// Case B: Single element, multiple possible values (Using regex alternation)
// Succeeds if the single element text matches either option.
await expect(element).toHaveText(/optionA|optionB/);
// Equivalent to:
await expect(element).toHaveText(['optionA', 'optionB']);

const elements = $$('myElements')
// === 2. MULTIPLE ELEMENTS (GLOBAL CHECK) ===
// Case C: Multiple elements, single value
// Every element in the list must match this exact text.
await expect(elements).toHaveText('myValue1');

// Case D: Multiple elements, global pool (Using regex alternation)
// Every element in the list must match either option.
await expect(elements).toHaveText(/optionA|optionB/);
// NOT Equivalent to:
await expect(elements).toHaveText(['optionA', 'optionB']);

// === 3. MULTIPLE ELEMENTS + INDEX-BASED ARRAYS ===
// Case E: Exact positional match
// Elements must match index-by-index: Element 0 must be 'valueForIndex0' AND Element 1 must be 'valueForIndex1'.
await expect(elements).toHaveText(['valueForIndex0', 'valueForIndex1']);

// Case F: Mixed positional constraints
// Element 0 must match the regex pattern AND Element 1 must match the exact string.
await expect(elements).toHaveText([
  /index0OptionA|index0OptionB/, 
  'index1OptionC'
]);


// === 4. NEGATION ===
// Case G: Standard negation
// Every element in the list must NOT match the regex pattern.
await expect(elements).not.toHaveText(/forbiddenTextA|forbiddenTextB/);

// === FUTURE ===
// To allow passing if at least one element matches, we can introduce a `.some` modifier.
await expect(elements).some.toHaveText('myValue1');
await expect(elements).some.toBeDisplayed();

// Use oneOf to ease passing multiple values
await expect(elements).toHaveText(/optionA|optionB/);
// Equivalent to:
await expect(elements).toHaveText(oneOf('optionA', 'optionB'));
// Element 0 must match the regex pattern AND Element 1 must match the exact string.
await expect(elements).toHaveText([
  oneOf('index0OptionA','index0OptionB'), 
  'index1OptionC'
]);
```
