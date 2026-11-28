describe('inline browser callsites', () => {
    it('writes two distinct local inline snapshots at their callsites', async () => {
        document.body.innerHTML = '<h1>local-inline-alpha</h1>'
        await expect($('h1')).toMatchInlineSnapshot(`"<h1>local-inline-alpha</h1>"`)
        await expect('local-inline-beta').toMatchInlineSnapshot(`"local-inline-beta"`)
    })
})
