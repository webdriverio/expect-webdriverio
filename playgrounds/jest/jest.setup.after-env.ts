/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, beforeAll, afterAll, expect } from "@jest/globals";
import { remote } from "webdriverio";
import { config } from "./wdio.conf";
import { matchers } from "expect-webdriverio";

jest.setTimeout(30000);

beforeAll(async () => {
    // Add custom wdio matcher to Jest's expect
    // TODO should MatchersObject type from Jest's expect lib. Fix incoming.
    // @disable-eslint-next-line @typescript-eslint/no-explicit-any -- Fix incoming
    expect.extend(matchers as any);

    globalThis.standalone = await remote(config);
});

afterAll(async () => {
    await globalThis.standalone?.deleteSession();
});
