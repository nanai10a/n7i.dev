/* eslint-env node, es2022 */

import { isMainThread } from "node:worker_threads";

import synckit from "synckit";

// eslint-disable-next-line @typescript-eslint/no-var-requires -- doesn't exists type definitions
const htmlnano = require("htmlnano");
import posthtml from "posthtml";

export const html = (input: string) => {
  const { html: output } = process(input);

  return output;
};

const ph = posthtml();
const process: (_input: string) => Awaited<ReturnType<typeof ph.process>> =
  synckit.createSyncFn(__filename);

if (!isMainThread) {
  const opts = {
    collapseWhitespace: "aggressive",
    minifyCss: false, // Tips: if this enabled, postcss inside htmlnano throws about cannot recognize properties prefixed `-webkit` .
  };

  synckit.runAsWorker(posthtml([htmlnano(opts, htmlnano.presets.max)]).process);
}
