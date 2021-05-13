declare const promise: Promise<object>

it('should do something', () => {
    expectAsync(promise).toBeDisplayed().then()
})
