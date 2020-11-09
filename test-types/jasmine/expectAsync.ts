declare const promise: Promise<object>

it('should do something', () => {
    // Promises shouldn't have the `foo` method.
    // @ts-expect-error
    expectAsync(promise).toBeDisplayed().foo()
})
