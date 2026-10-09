import { expect as wdioExpect } from 'expect-webdriverio'
declare const el: WebdriverIO.Element

// The custom matchers and the custom option of `custom.ts`, as a user adds them
export async function checkCustom() {
    void wdioExpect(1).toBeCustomWdio('a')
    await wdioExpect(el).toBeCustomElement()
    await wdioExpect(el).not.toBeCustomElement()
    // @ts-expect-error the custom matcher is only on an element
    await wdioExpect('text').toBeCustomElement()
    await wdioExpect(el).toHaveText(wdioExpect.toBeCustomAsymmetric('a'))
    await wdioExpect(el).not.toHaveText(wdioExpect.toBeCustomAsymmetric('a'))
    await wdioExpect(el).toHaveText('a', { customOption: 'value', ignoreCase: true })
    await wdioExpect(el).toBeDisplayed({ customOption: 'value' })
    // @ts-expect-error the custom option is a string
    await wdioExpect(el).toHaveText('a', { customOption: 1 })
    // The matchers of the package stay
    await wdioExpect(el).toHaveText('a')
}
