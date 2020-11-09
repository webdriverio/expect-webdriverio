declare const promise: Promise<object>

it('should do something', () => {
    // Promises shouldn't have the `foo` method.
    expectAsync(promise)
        .toBeDisplayed()
        // @ts-expect-error
        .foo()

    expectAsync(promise).toBeDisplayed().then()
})
