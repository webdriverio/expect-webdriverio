import { vi } from 'vitest'

vi.mock('../../../../../src/util/refetchElements.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../../../src/util/refetchElements.js')>()
    return {
        ...actual,
        refetchElements: vi.spyOn(actual, 'refetchElements'),
        refreshElementArray: vi.spyOn(actual, 'refreshElementArray'),
        syncronizeElements: vi.spyOn(actual, 'syncronizeElements'),
        syncronizeChainableElementArray: vi.spyOn(actual, 'syncronizeChainableElementArray'),
        syncronizeElementArray: vi.spyOn(actual, 'syncronizeElementArray')
    }
})
