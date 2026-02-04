import { jest, beforeAll, afterAll, expect } from "@jest/globals";
import { remote } from "webdriverio";
import { config } from "./wdio.conf";
import { matchers } from "expect-webdriverio";

jest.setTimeout(30000);

beforeAll(async () => {
    // Ad custom wdio matcher to Jest's expect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect.extend(matchers as Record<string, any>);

    globalThis.standalone = await remote(config);
});

afterAll(async () => {
    await globalThis.standalone?.deleteSession();
});
