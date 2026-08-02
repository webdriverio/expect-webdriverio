import { vi } from 'vitest'

vi.mock('../../../../../src/util/refetchElements.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../../../src/util/refetchElements.js')>()
    return {
        ...actual,
        refetchElements: vi.spyOn(actual, 'refetchElements'),
        refreshElements: vi.spyOn(actual, 'refreshElements'),
    }
})
