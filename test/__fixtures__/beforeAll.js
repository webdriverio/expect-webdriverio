beforeAll(() => {
    // default options
    if (expect._expectWebdriverio) {
        expect._expectWebdriverio.options.wait = 50
        expect._expectWebdriverio.options.interval = 10
    }
})
