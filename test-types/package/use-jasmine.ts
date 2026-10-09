declare const el: WebdriverIO.Element

// The custom matchers and the custom option of `custom.ts`, as a user adds them
export async function checkCustom() {
    void expectAsync(1).toBeCustomWdio('a')
    await expectAsync(el).toBeCustomElement()
    await expectAsync(el).not.toBeCustomElement()
    // @ts-expect-error the custom matcher is only on an element
    await expectAsync('text').toBeCustomElement()
    await expectAsync(el).toHaveText('a', { customOption: 'value', ignoreCase: true })
    await expectAsync(el).toBeDisplayed({ customOption: 'value' })
    // @ts-expect-error the custom option is a string
    await expectAsync(el).toHaveText('a', { customOption: 1 })
    // The matchers of the package stay
    await expectAsync(el).toHaveText('a')
}
