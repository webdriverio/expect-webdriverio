import { addMatchers } from '../src/addMatchers'
import { setOptions } from '../src'

jest.mock('../src/addMatchers', () => ({
    addMatchers: jest.fn()
}))
jest.mock('../src/options', () => ({
    setDefaultOptions: 'setDefaultOptions'
}))

test('index', () => {
    expect(addMatchers).toBeCalledTimes(1)
    expect(setOptions).toBe('setDefaultOptions')
})
