import { jest, beforeAll, afterAll, expect } from "@jest/globals";
import { remote } from "webdriverio";
import { config } from "./wdio.conf";
import { wdioCustomMatchers } from "expect-webdriverio";

jest.setTimeout(30000);

beforeAll(async () => {
    // Add custom wdio matcher to Jest's expect
    expect.extend(wdioCustomMatchers);

    globalThis.standalone = await remote(config);
});

afterAll(async () => {
    await globalThis.standalone?.deleteSession();
});
