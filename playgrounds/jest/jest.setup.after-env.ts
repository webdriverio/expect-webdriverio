import { jest, beforeAll, afterAll, expect } from "@jest/globals";
import { remote } from "webdriverio";
import { config } from "./wdio.conf";
import { matchers } from "expect-webdriverio";

jest.setTimeout(30000);

beforeAll(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect.extend(matchers as Record<string, any>);

  // The enhanced expect already has matchers extended, no need to extend again
  globalThis.standalone = await remote(config);
  console.log('Browser session started with sessionId:', globalThis.standalone.sessionId);
});

afterAll(async () => {
    console.log('Ending browser session with sessionId:', globalThis.standalone?.sessionId);
  await globalThis.standalone?.deleteSession();
});
