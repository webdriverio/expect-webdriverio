import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils'
import { toHaveClass, toHaveElementClass } from '../../../src/matchers/element/toHaveClass'

describe('toHaveElementClass', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
        el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
            if(attribute === 'class') {
                return 'some-class another-class'
            }
            return null
        })
    })

    test('success when class name is present', async () => {
        const result = await toHaveElementClass(el, "some-class")
        expect(result.pass).toBe(true)
    })

    test('success with RegExp when class name is present', async () => {
        const result = await toHaveElementClass(el, /sOmE-cLaSs/i)
        expect(result.pass).toBe(true)
    })

    describe('options', () => {
        it('should fail when class is not a string', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return null
            })
            const result = await toHaveElementClass(el, "some-class")
            expect(result.pass).toBe(false)
        })

        it('should pass when trimming the attribute', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return "  some-class  "
            })
            const result = await toHaveElementClass(el, "some-class", {trim: true})
            expect(result.pass).toBe(true)
        })

        it('should pass when ignore the case', async () => {
            const result = await toHaveElementClass(el, "sOme-ClAsS", {ignoreCase: true})
            expect(result.pass).toBe(true)
        })

        it('should pass if containing', async () => {
            const result = await toHaveElementClass(el, "some", {containing: true})
            expect(result.pass).toBe(true)
        })
    })

    describe('failure when class name is not present', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveElementClass(el, "test")
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have class')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('test')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('some-class another-class')
            })
        })
    })

    describe('failure with RegExp when class name is not present', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveElementClass(el, /WDIO/)
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have class')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('/WDIO/')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('some-class another-class')
            })
        })
    })
})

global.console.warn = jest.fn()

describe('toHaveClass', () => {
    let el: WebdriverIO.Element

    test('warning message in console', async () => {
        await toHaveClass(el, "test")
        expect(console.warn).toHaveBeenCalledWith('expect(...).toHaveClass is deprecated and will be removed in next release. Use toHaveElementClass instead.')
    })
})
