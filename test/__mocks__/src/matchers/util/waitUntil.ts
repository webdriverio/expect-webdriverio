import { vi } from 'vitest'

vi.mock('../../../../../src/util/waitUntil.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../../../src/util/waitUntil.js')>()
    return {
        ...actual,
        waitUntil: vi.spyOn(actual, 'waitUntil'),
    }
})
