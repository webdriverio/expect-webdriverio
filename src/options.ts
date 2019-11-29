const DEFAULT_OPTIONS = {
    wait: 2000,
    interval: 100,
}

if (!global.expect._expectWebdriverioOptions) {
    global.expect._expectWebdriverioOptions = { ...DEFAULT_OPTIONS }
}

export const getDefaultOptions = () => global.expect._expectWebdriverioOptions

export const setDefaultOptions = (options = {}) => {
    Object.entries(options).forEach(([key, value]) => {
        if (key in DEFAULT_OPTIONS) {
            // @ts-ignore
            global.expect._expectWebdriverioOptions[key] = value
        }
    })
}
