export function matcherNameToString(matcherName: string) {
    return matcherName.replace(/([A-Z])/g, ' $1').toLowerCase()
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

export function removeColors(msg: string) {
    // eslint-disable-next-line no-control-regex
    const s = msg.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
    return s
}
