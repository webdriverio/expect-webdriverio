import { describe, expect, it, vi } from 'vitest'
import { $ } from '@wdio/globals'
import { executeCommandWithStrategy } from '../../src/util/executeCommand'

vi.mock('@wdio/globals')

describe.skip('executeCommand', () => {

    describe(executeCommandWithStrategy, () => {

        it('should call the legacy strategy when strategy is LegacyLooseMultipleElements', async () => {
            const legacyMultipleElementResultsStrategySpy = vi.spyOn(
                await import('../../src/util/executeCommand'),
                'legacyMultipleElementResultsStrategy'
            )

            await executeCommandWithStrategy({
                unresolvedElements: $('selector'),
                expectedValues: 'expected',
                singleElementCompare: async () => ({ result: true, value: 'actual' }),
                isNot: false,
                strategy: 'LegacyLooseMultipleElements'
            })

            expect(legacyMultipleElementResultsStrategySpy).toHaveBeenCalled()
        })

        it('should call the new strategy when strategy is not LegacyLooseMultipleElements', async () => {
            const multipleElementResultsStrategySpy = vi.spyOn(
                await import('../../src/util/executeCommand'),
                'multipleElementResultsStrategy'
            )

            await executeCommandWithStrategy({
                unresolvedElements: $('selector'),
                expectedValues: 'expected',
                singleElementCompare: async () => ({ result: true, value: 'actual' }),
                isNot: false,
                strategy: 'NewStrictMultipleElements'
            })

            expect(multipleElementResultsStrategySpy).toHaveBeenCalled()
        })

    })
})
