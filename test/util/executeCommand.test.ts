import { executeCommand } from '../../src/util/executeCommand'

describe('refetchElements', () => {
    test('is array', async () => {
        const els = await $$('sel') 
        // @ts-ignore
        els.parent._length = 5;
        // Passing in array should cause elements
        // to be refetched hence length should be 5
        const condition = jest.fn(() => { return { result: true, value: "Test Value "} } )

        // @ts-ignore
        const result = await executeCommand.call(this, els, condition, {}, ["Test Property", "Test Value"], true)
        expect(condition).toHaveBeenCalledTimes(5)
    })

    test('empty array', async () => {
        const els = await $$('sel') 
        while (els.length > 0) { els.pop() }
        // Passing in array should cause elements
        // to be refetched hence length should be 5
        const condition = jest.fn(() => { return { result: true, value: "Test Value "} } )

        // @ts-ignore
        const result = await executeCommand.call(this, els, condition, {wait: 0}, ["Test Property", "Test Value"])
        expect(condition).toHaveBeenCalledTimes(0)
        expect(result).toEqual({
            el: els,
            success: false
        })
    })
})
