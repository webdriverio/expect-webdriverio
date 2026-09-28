declare const el: WebdriverIO.Element

export async function check() {
    await expectAsync(el).toHaveText('text')
    // @ts-expect-error an attribute name is a string
    await expectAsync(el).toHaveAttribute(1)
}
