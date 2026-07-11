export function matcherNameLastWords(matcherName: string) {
    return matcherName.replace(/^toHave/, '').replace(/^toBe/, '')
        .replace(/([A-Z])/g, ' $1').trim().toLowerCase()
}

export function lastMatcherWords(matcherName: string) {
    return matcherName.replace(/^(toBe|toHave|to)/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase()
}
