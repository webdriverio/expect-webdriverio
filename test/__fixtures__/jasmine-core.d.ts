/** `jasmine-core` has no type declarations. The equality tests use only its asymmetric matcher factories. */
declare module 'jasmine-core' {
    type AsymmetricMatcherFactory = (...args: unknown[]) => { asymmetricMatch(other: unknown, matchersUtil?: unknown): boolean }
    type AsymmetricMatcherName = 'any' | 'anything' | 'objectContaining' | 'arrayContaining' | 'arrayWithExactContents'
        | 'setContaining' | 'mapContaining' | 'stringContaining' | 'stringMatching' | 'truthy' | 'falsy' | 'empty' | 'notEmpty' | 'is'
    const jasmineRequire: {
        core(jasmineRequire: unknown): Record<AsymmetricMatcherName, AsymmetricMatcherFactory>
    }
    export default jasmineRequire
}
