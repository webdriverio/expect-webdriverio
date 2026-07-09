import { vi } from 'vitest'

vi.mock('../../../../src/utils.js', async (importOriginal) => {

    const actual = await importOriginal<typeof import('../../../../src/utils.js')>()
    return {
        ...actual,
        executeCommandBe: vi.spyOn(actual, 'executeCommandBe'),
    }
})
