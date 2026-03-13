export function matcherNameLastWords(matcherName: string) {
    return matcherName.replace(/^toHave/, '').replace(/^toBe/, '')
        .replace(/([A-Z])/g, ' $1').trim().toLowerCase()
}

export function getExpectMessage(msg: string) {
    return msg.split('\n')[0]
}

export function getExpected(msg: string) {
    return getReceivedOrExpected(msg, 'Expected')
}

export function getReceived(msg: string) {
    return getReceivedOrExpected(msg, 'Received')
}

function getReceivedOrExpected(msg: string, type: string) {
    return msg.split('\n').find((line, idx) => idx > 1 && line.startsWith(type))
}
