import { multiRemoteBrowser } from '@wdio/globals'

describe('Multi-remote Snapshot Matchers', () => {
    beforeEach(async () => {
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
    })

    it('should snapshot the outerHTML shared by every browser as is', async () => {
        await expect(multiRemoteBrowser.$('#githubRepo')).toMatchInlineSnapshot(`"<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo</a>"`)
    })

    it('should snapshot the outerHTML of every browser when it differs', async () => {
        await multiRemoteBrowser.getInstance('firefox')!.execute(() => {
            document.querySelector('#githubRepo')!.textContent = 'GitHub Repo on Firefox'
        })

        await expect(multiRemoteBrowser.$('#githubRepo')).toMatchInlineSnapshot(`
          {
            "chrome": "<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo</a>",
            "firefox": "<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo on Firefox</a>",
          }
        `)
    })

    it('should snapshot the outerHTML of every element shared by every browser as is', async () => {
        await expect(multiRemoteBrowser.$$('h1')).toMatchInlineSnapshot(`
          [
            "<h1>WebdriverJS Testpage</h1>",
            "<h1 class="findme">Test CSS Attributes</h1>",
          ]
        `)
    })

    it('should snapshot the outerHTML of every element of every browser when they differ', async () => {
        await multiRemoteBrowser.getInstance('firefox')!.execute(() => {
            document.querySelector('h1.findme')!.remove()
        })

        await expect(multiRemoteBrowser.$$('h1')).toMatchInlineSnapshot(`
          {
            "chrome": [
              "<h1>WebdriverJS Testpage</h1>",
              "<h1 class="findme">Test CSS Attributes</h1>",
            ],
            "firefox": [
              "<h1>WebdriverJS Testpage</h1>",
            ],
          }
        `)
    })

    it('should snapshot the outerHTML of the selected browsers only', async () => {
        await expect(multiRemoteBrowser.select('firefox').$('#githubRepo')).toMatchInlineSnapshot(`"<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo</a>"`)
    })

    it('should snapshot the outerHTML of every element of the selected browsers only', async () => {
        await multiRemoteBrowser.getInstance('chrome')!.execute(() => {
            document.querySelector('h1.findme')!.remove()
        })

        await expect(multiRemoteBrowser.select('firefox').$$('h1')).toMatchInlineSnapshot(`
          [
            "<h1>WebdriverJS Testpage</h1>",
            "<h1 class="findme">Test CSS Attributes</h1>",
          ]
        `)
    })

    it('should snapshot the outerHTML of every element of an awaited $$()', async () => {
        const headings = await multiRemoteBrowser.$$('h1')

        await expect(headings).toMatchInlineSnapshot(`
          [
            "<h1>WebdriverJS Testpage</h1>",
            "<h1 class="findme">Test CSS Attributes</h1>",
          ]
        `)
    })

    it('should snapshot an empty $$() as an empty array', async () => {
        await expect(multiRemoteBrowser.$$('.does-not-exist')).toMatchInlineSnapshot('[]')
    })

    it('should match the outerHTML snapshot file of every browser', async () => {
        await multiRemoteBrowser.getInstance('firefox')!.execute(() => {
            document.querySelector('#githubRepo')!.textContent = 'GitHub Repo on Firefox'
        })

        await expect(multiRemoteBrowser.$('#githubRepo')).toMatchSnapshot()
        await expect(multiRemoteBrowser.$$('h1')).toMatchSnapshot()
    })
})
