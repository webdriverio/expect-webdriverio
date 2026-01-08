# Multiple Elements Support

All element matchers work with arrays of elements (e.g., `$$()` results).
- **Strict Length Matching**: If you provide an array of expected values, the number of values must match the number of elements found. A failure occurs if the lengths differ.
- **Index-based Matching**: When using an array of expected values, each element is compared to the value at the corresponding index.
- **Single Value Matching**: If you provide a single expected value, it is compared against *every* element in the array.
- **Asymmetric Matchers**: Asymmetric matchers can be used within the expected values array for more matching flexibility.
- If no elements exist, a failure occurs (except with `toBeElementsArrayOfSize`).
- Options like `StringOptions` or `HTMLOptions` apply to the entire array (except `NumberOptions`).
- The assertion passes only if **all** elements match the expected value(s).
- Using `.not` applies the negation to each element (e.g., *all* elements must *not* display).

**Note:** Strict length matching does not apply on `toHaveText` to preserve existing behavior.

## Limitations
- An alternative to using `StringOptions` (like `ignoreCase` or `containing`) for a single expected value is to use RegEx (`/MyExample/i`) or Asymmetric Matchers (`expect.stringContaining('Example')`).
- Passing an array of "containing" values, as previously supported by `toHaveText`, is deprecated and not supported for other matchers.

## Supported types

Any of the below element types can be passed to `expect`:
- `ChainablePromiseArray` (the non-awaited case)
- `ElementArray` (the awaited case)
- `Element[]` (the filtered case)
