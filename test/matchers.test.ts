import { test, expect, vi, describe } from 'vitest'
import { matchers, expect as expectLib } from '../src/index.js'
import { $ } from '@wdio/globals'

vi.mock('@wdio/globals')

const ALL_MATCHERS = [
    // browser
    'toHaveClipboardText',
    'toHaveLocalStorageItem',
    'toHaveTitle',
    'toHaveUrl',

    // element
    'toBeClickable',
    'toBeDisabled',
    'toBeDisplayed',
    'toBeDisplayedInViewport',
    'toBeEnabled',
    'toExist',
    'toBeExisting',
    'toBePresent',
    'toBeFocused',
    'toBeSelected',
    'toBeChecked',
    'toHaveAttributeAndValue',
    'toHaveAttribute',
    'toHaveAttr',
    'toHaveChildren',
    'toHaveClass',
    'toHaveElementClass',
    'toHaveClassContaining',
    'toHaveComputedLabel',
    'toHaveComputedRole',
    'toHaveElementProperty',
    'toHaveHeight',
    'toHaveHref',
    'toHaveLink',
    'toHaveHTML',
    'toHaveId',
    'toHaveSize',
    'toHaveStyle',
    'toHaveText',
    'toHaveValue',
    'toHaveWidth',

    // elements
    'toBeElementsArrayOfSize',

    // mock
    'toBeRequested',
    'toBeRequestedTimes',
    'toBeRequestedWith',
    'toBeRequestedWithResponse',

    // snapshot
    'toMatchSnapshot',
    'toMatchInlineSnapshot'
]

test('matchers', () => {
    expect([...matchers.keys()]).toEqual(ALL_MATCHERS)
})

test('allows to add matcher', () => {
    const matcher: any = vi.fn((actual, expected) => ({ pass: actual === expected }))
    expectLib.extend({ toBeCustom: matcher })

    // @ts-expect-error not in types
    expectLib('foo').toBeCustom('foo')
    expect(matchers.keys()).toContain('toBeCustom')
})

test('Generic asymmetric matchers from Expect library should work', () => {
    expectLib(1).toEqual(expectLib.closeTo(1.0001, 0.0001))
    expectLib(['apple', 'banana', 'cherry']).toEqual(expectLib.arrayOf(expectLib.any(String)))
})

describe('Custom Wdio Matchers Integration Tests', async () => {

    describe('Matchers pass with success with default mocked values', async () => {
        const el = await $('selector')

        test('toBe matchers', async () => {
            await expectLib(el).toBeDisplayed()
            await expectLib(el).toBeExisting()
            await expectLib(el).toBeEnabled()
            await expectLib(el).toBeClickable()
            await expectLib(el).toBeFocused()
            await expectLib(el).toBeSelected()
        })

        test('toHave matchers', async () => {
            await expectLib(el).toHaveText('Valid Text')
            await expectLib(el).toHaveHTML('<Html/>')
            await expectLib(el).toHaveComputedLabel('Computed Label')
            await expectLib(el).toHaveComputedRole('Computed Role')
            await expectLib(el).toHaveSize({ width: 100, height: 50 })
            await expectLib(el).toHaveHeight(50)
            await expectLib(el).toHaveWidth(100)
            await expectLib(el).toHaveAttribute('someAttribute', 'some attribute')
            await expectLib(el).toHaveAttribute('someAttribute')
            await expectLib(el).toHaveAttr('someAttribute', 'some attribute')
            await expectLib(el).toHaveElementProperty('someProperty', '1')
        })
    })

    describe('Matchers fails when using `.not` with proper message', async () => {
        const el = await $('selector')

        test('toBe matchers', async () => {
            await expect(() => expectLib(el).not.toBeDisplayed({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to be displayed

Expected [not]: "not displayed"
Received      : "displayed"`
            )

            await expect(() => expectLib(el).not.toBeExisting({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to be existing

Expected [not]: "not existing"
Received      : "existing"`
            )

            await expect(() => expectLib(el).not.toBeEnabled({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to be enabled

Expected [not]: "not enabled"
Received      : "enabled"`
            )

            await expect(() => expectLib(el).not.toBeClickable({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to be clickable

Expected [not]: "not clickable"
Received      : "clickable"`
            )

            await expect(() => expectLib(el).not.toBeFocused({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to be focused

Expected [not]: "not focused"
Received      : "focused"`
            )

            await expect(() => expectLib(el).not.toBeSelected({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to be selected

Expected [not]: "not selected"
Received      : "selected"`
            )
        })

        test('toHave matchers', async () => {
            await expect(() => expectLib(el).not.toHaveText(' Valid Text ', { trim: false, wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to have text

Expected [not]: " Valid Text "
Received      : " Valid Text "`
            )

            await expect(() => expectLib(el).not.toHaveHTML('<Html/>', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to have HTML

Expected [not]: "<Html/>"
Received      : "<Html/>"`
            )

            await expect(() => expectLib(el).not.toHaveComputedLabel('Computed Label', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to have computed label

Expected [not]: "Computed Label"
Received      : "Computed Label"`
            )

            await expect(() => expectLib(el).not.toHaveComputedRole('Computed Role', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to have computed role

Expected [not]: "Computed Role"
Received      : "Computed Role"`
            )
        })

        test('size matchers', async () => {
            await expect(() => expectLib(el).not.toHaveSize({ width: 100, height: 50 }, { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to have size

Expected [not]: {"height": 50, "width": 100}
Received      : {"height": 50, "width": 100}`
            )

            await expect(() => expectLib(el).not.toHaveHeight(50, { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to have height

Expected [not]: 50
Received      : 50`
            )

            await expect(() => expectLib(el).not.toHaveWidth(100, { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) not to have width

Expected [not]: 100
Received      : 100`
            )
        })

        test('attribute and property matchers', async () => {
            await expect(() => expectLib(el).not.toHaveAttribute('someAttribute', 'some attribute')).rejects.toThrow(`\
Expect $(\`selector\`) not to have attribute someAttribute

Expected [not]: "some attribute"
Received      : "some attribute"`
            )

            await expect(() => expectLib(el).not.toHaveAttribute('someAttribute')).rejects.toThrow(`\
Expect $(\`selector\`) not to have attribute someAttribute

Expected [not]: false
Received      : true`
            )

            await expect(() => expectLib(el).not.toHaveAttr('someAttribute', 'some attribute')).rejects.toThrow(`\
Expect $(\`selector\`) not to have attribute someAttribute

Expected [not]: "some attribute"
Received      : "some attribute"`
            )
            await expect(() => expectLib(el).not.toHaveElementProperty('someProperty', '1')).rejects.toThrow(`\
Expect $(\`selector\`) not to have property someProperty

Expected [not]: "1"
Received      : "1"`
            )
        })
    })

    describe('Matchers fails with proper messages', async () => {
        const el = await $('selector')
        vi.mocked(el.isDisplayed).mockResolvedValue(false)
        vi.mocked(el.isExisting).mockResolvedValue(false)
        vi.mocked(el.isEnabled).mockResolvedValue(false)
        vi.mocked(el.isClickable).mockResolvedValue(false)
        vi.mocked(el.isFocused).mockResolvedValue(false)
        vi.mocked(el.isSelected).mockResolvedValue(false)

        test('Ensure toBe matchers throws and show proper failing message', async () => {
            await expect(() => expectLib(el).toBeDisplayed({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)

            await expect(() => expectLib(el).toBeExisting({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to be existing

Expected: "existing"
Received: "not existing"`)

            await expect(() => expectLib(el).toExist({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to exist

Expected: "exist"
Received: "not exist"`)

            await expect(() => expectLib(el).toBeEnabled({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to be enabled

Expected: "enabled"
Received: "not enabled"`)

            await expect(() => expectLib(el).toBeClickable({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to be clickable

Expected: "clickable"
Received: "not clickable"`)

            await expect(() => expectLib(el).toBeFocused({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to be focused

Expected: "focused"
Received: "not focused"`)

            await expect(() => expectLib(el).toBeSelected({ wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to be selected

Expected: "selected"
Received: "not selected"`)

        })

        test('Ensure toHave matchers throws and show proper failing message', async () => {
            await expect(() => expectLib(el).toHaveText('Some other text', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have text

Expected: "Some other text"
Received: " Valid Text "`)

            await expect(() => expectLib(el).toHaveHTML('<SomeOtherHtml/>', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have HTML

Expected: "<SomeOtherHtml/>"
Received: "<Html/>"`)

            await expect(() => expectLib(el).toHaveComputedLabel('Some Other Computed Label', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have computed label

Expected: "Some Other Computed Label"
Received: "Computed Label"`)

            await expect(() => expectLib(el).toHaveComputedRole('Some Other Computed Role', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have computed role

Expected: "Some Other Computed Role"
Received: "Computed Role"`)

            await expect(() => expectLib(el).toHaveElementProperty('someProperty', 'some other value', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have property someProperty

Expected: "some other value"
Received: "1"`)

        })

        test('Ensure toHaveAttribute matchers throw and show proper failing message', async () => {
            await expect(() => expectLib(el).toHaveAttribute('someAttribute', 'some other attribute', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have attribute someAttribute

Expected: "some other attribute"
Received: "some attribute"`)

            vi.mocked(el.getAttribute).mockResolvedValue(null as unknown as string)
            await expect(() => expectLib(el).toHaveAttribute('notExistingAttribute')).rejects.toThrow(`\
Expect $(\`selector\`) to have attribute notExistingAttribute

Expected: true
Received: false`)
            await expect(() => expectLib(el).toHaveAttr('someAttribute', 'some other attribute', { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have attribute someAttribute

Expected: "some other attribute"
Received: null`)
        })

        test('Ensure toHaveSize, toHaveHeight, toHaveWidth matchers throw and show proper failing message', async () => {
            await expect(() => expectLib(el).toHaveSize({ width: 200, height: 100 }, { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have size

- Expected  - 2
+ Received  + 2

  Object {
-   "height": 100,
-   "width": 200,
+   "height": 50,
+   "width": 100,
  }`)
            await expect(() => expectLib(el).toHaveHeight(100, { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have height

Expected: 100
Received: 50`)

            await expect(() => expectLib(el).toHaveWidth(200, { wait: 1 })).rejects.toThrow(`\
Expect $(\`selector\`) to have width

Expected: 200
Received: 100`)
        })

    })

    describe('Matchers pass when using `.not`', async () => {
        const el = await $('selector')
        vi.mocked(el.isDisplayed).mockResolvedValue(false)
        vi.mocked(el.isExisting).mockResolvedValue(false)
        vi.mocked(el.isEnabled).mockResolvedValue(false)
        vi.mocked(el.isClickable).mockResolvedValue(false)
        vi.mocked(el.isFocused).mockResolvedValue(false)
        vi.mocked(el.isSelected).mockResolvedValue(false)

        test('toBe matchers', async () => {
            await expectLib(el).not.toBeDisplayed({ wait: 1 })
            await expectLib(el).not.toBeExisting({ wait: 1 })
            await expectLib(el).not.toBeEnabled({ wait: 1 })
            await expectLib(el).not.toBeClickable({ wait: 1 })
            await expectLib(el).not.toBeFocused({ wait: 1 })
            await expectLib(el).not.toBeSelected({ wait: 1 })
        })

        test('toHave matchers', async () => {
            await expectLib(el).not.toHaveText('Some other text', { wait: 1 })
            await expectLib(el).not.toHaveHTML('<SomeOtherHtml/>', { wait: 1 })
            await expectLib(el).not.toHaveComputedLabel('Some Other Computed Label', { wait: 1 })
            await expectLib(el).not.toHaveComputedRole('Some Other Computed Role', { wait: 1 })
            await expectLib(el).not.toHaveElementProperty('someProperty', 'some other value', { wait: 1 })
            await expectLib(el).not.toHaveAttribute('someAttribute', 'some other attribute', { wait: 1 })
            await expectLib(el).not.toHaveAttr('someAttribute', 'some other attribute', { wait: 1 })
            await expectLib(el).not.toHaveSize({ width: 200, height: 100 }, { wait: 1 })
            await expectLib(el).not.toHaveHeight(100, { wait: 1 })
            await expectLib(el).not.toHaveWidth(200, { wait: 1 })
        })

    })

    // Skipped since even though logically correct, this is not too user-friendly and breaks today's current expected behaviour, see https://github.com/webdriverio/expect-webdriverio/issues/2013
    describe.skip('Matcher eventually passing', async () => {

        test('when element eventually is displayed, matcher and .not matcher should be consistent', async () => {
            const el = await $('selector')
            vi.mocked(el.isDisplayed)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true)

            // Passes when element becomes displayed
            await expectLib(el).toBeDisplayed({ wait: 300, interval: 100 })

            vi.mocked(el.isDisplayed)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true)

            // Should not pass with the same scenario to be consistent
            await expect(() => expectLib(el).not.toBeDisplayed({ wait: 300, interval: 100 })).rejects.toThrow(`\
Expect $(\`selector\`) not to be displayed

Expected [not]: "not displayed"
Received      : "displayed"`)

            expect(el.isDisplayed).toHaveBeenCalledTimes(6)
        })

        test('when element eventually is not displayed, matcher and .not matcher should be consistent', async () => {
            const el = await $('selector')
            vi.mocked(el.isDisplayed)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false)

            // Does not pass since element never becomes displayed
            await expect(expectLib(el).toBeDisplayed({ wait: 300, interval: 100 })).rejects.toThrow(`\
Expect $(\`selector\`) to be displayed

Expected: "displayed"
Received: "not displayed"`)

            vi.mocked(el.isDisplayed)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false)

            // Should pass with the same scenario to be consistent
            await expectLib(el).not.toBeDisplayed({ wait: 300, interval: 100 })

            expect(el.isDisplayed).toHaveBeenCalledTimes(6)
        })
    })

    describe('Matchers should cover real life scenarios', async () => {
        test('Using toBeDisplayed and not.toBeDisplayed before and after a component is being discarded should work easily', async () => {
            const el = await $('selector')

            // Element takes time to display
            vi.mocked(el.isDisplayed)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true)

            // Passes when element becomes displayed
            await expectLib(el).toBeDisplayed()

            // The element ok button is clicked and the component is discarded...

            // ...but the element takes time to be removed from the DOM (below 500 ms in real life)
            vi.mocked(el.isDisplayed)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false)

            // We should be able to assert that the element is no longer displayed by default without additional code or configuration
            await expectLib(el).not.toBeDisplayed()
        })
    })
})
