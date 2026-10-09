import { jest, beforeAll, afterAll, expect } from "@jest/globals";
import { remote } from "webdriverio";
import { config } from "./wdio.conf";
import { wdioCustomMatchers, expect as wdioExpect } from "expect-webdriverio";

jest.setTimeout(30000);

beforeAll(async () => {
    // Add custom wdio matcher to Jest's expect
    expect.extend(wdioCustomMatchers);

    // Add the soft assertions of the expect-webdriverio `expect`
    for (const name of ["soft", "getSoftFailures", "assertSoftFailures", "clearSoftFailures"] as const) {
        Object.defineProperty(expect, name, { value: wdioExpect[name] });
    }

    globalThis.standalone = await remote(config);
});

afterAll(async () => {
    await globalThis.standalone?.deleteSession();
});
