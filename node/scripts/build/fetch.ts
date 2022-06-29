/* eslint-env node, es2022 */

import { isMainThread } from "node:worker_threads";

import synckit from "synckit";

// minimal declarations of fetch api in node (from browser)
declare interface Response {
  text(): Promise<string>;
}

declare function fetch(_resource: unknown, _init?: unknown): Promise<Response>;

// wrap fetch api
// TODO: check passable URL as string
export const fetchSync: (_url: URL) => string = synckit.createSyncFn(__filename);

export default fetchSync;

// execute from worker
if (!isMainThread) {
  synckit.runAsWorker(fetch);
}
