declare const el: WebdriverIO.Element

export async function check() {
    await expect(el).toHaveText('text')
    // @ts-expect-error an attribute name is a string
    await expect(el).toHaveAttribute(1)
}
