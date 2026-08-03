// import type { StringOptions } from 'expect-webdriverio'
// import { compareText, } from '../../utils.js'
// import { WdioAsymmetricMatchers } from './asymmetricsUtils.js'
// import { OneOfMatcher } from './oneOf.js'

// /**
//  * oneOf matcher is used to check if a string matches any of the provided strings or regular expressions.
//  */
// export class MultiRemoteText extends WdioAsymmetricMatchers<MaybeArrayOrMultiRemoteValues<string | RegExp | AsymmetricMatcher<string>>> {
//     public options: StringOptions = {}

//     constructor(browser: WebdriverIO.MultiRemoteBrowser, sample: MaybeArrayOrMultiRemoteValues<string | RegExp | AsymmetricMatcher<string>>) {
//         super(sample)
//     }

//     private setOptions(options: StringOptions): MultiRemoteText {
//         this.options = options
//         return this
//     }

//     public asymmetricMatch(actual: string | string[]): boolean {
//         if (Array.isArray(this.sample) && Array.isArray(actual)) {
//             return this.sample.every((sampleValue, index) => {
//                 return compareText(actual[index], sampleValue, this.options).success
//             })
//         } else if (typeof this.sample === 'object' ) {
//             const intanceNames = Object.keys(this.sample)
//             const expectedValues = Object.values(this.sample)
//             return browser.select(intanceNames)
//         }
//         return compareText(actual, this.sample, this.options).success
//     }

//     public withOptions(options: StringOptions): MultiRemoteText {
//         // When `toHave` Matchers want to injects their global options into the asymmetric matcher,
//         // we need to clone it to avoid mutating the original matcher instance if reuses in multiple assertions with different options.
//         return new MultiRemoteText(...this.sample).setOptions(options)
//     }

//     // Allow pretty-print in failure messages without quote for a better generic message
//     public toAsymmetricMatcher() {
//     // 1. Determine the prefix based on string options
//         let prefix = ''

//         if (this.options.containing) {
//             prefix = 'containing'
//         } else if (this.options.atStart) {
//             prefix = 'startingWith'
//         } else if (this.options.atEnd) {
//             prefix = 'endingWith'
//         } else if (typeof this.options.atIndex === 'number') {
//             prefix = `matchingAtIndex<${this.options.atIndex}>`
//         }

//         // 2. Handle whether sample is an array (oneOf) or a single value
//         const isArray = Array.isArray(this.sample)
//         const samples = isArray ? this.sample : [this.sample]

//         const formattedSamples = samples
//             .map((s) => (s instanceof RegExp ? s.toString() : `"${s}"`))
//             .join(', ')

//         // 3. Combine prefix with 'OneOf' suffix if it's an array, otherwise keep casing clean
//         if (isArray) {
//             prefix = prefix ? prefix + 'OneOf' : 'oneOf'
//         }

//         // Return final structured matcher format
//         return prefix ? `${prefix}<${formattedSamples}>` : formattedSamples
//     }
// }

// export function oneOf(...sample: Array<string | RegExp | AsymmetricMatcher<string> | null>): OneOfMatcher {
//     return new OneOfMatcher(...sample)
// }
