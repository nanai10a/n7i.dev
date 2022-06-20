/* eslint-env node, es2022 */

import json from "@iconify/json";
import utils from "@iconify/utils";
// bundle iconify modules
const iconify = { json, utils };

import * as fs from "./fs";
import Path from "./path";
import * as html from "./html";

export const getIconData = (ctx: Context, set: string, name: string) => {
  if (ctx.coll[set]?.[name] === undefined) {
    loadIconData(ctx, set, name);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const content = ctx.coll[set]![name]!;
  const svg = html.makeSVG(content, {});

  return svg;
};

const loadIconData = (ctx: Context, set: string, name: string) => {
  if (ctx.raw[set] === undefined) {
    loadIconSet(ctx, set);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const data = iconify.utils.getIconData(ctx.raw[set]!, name, false);
  if (data === null) {
    throw new Error(`failed to resolve icon: ${set} - ${name}`);
  }

  ctx.coll[set] = ctx.coll[set] ?? {};
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ctx.coll[set]![name] = data.body;
};

const loadIconSet = (ctx: Context, set: string) => {
  const path = new Path(iconify.json.locate(set).toString());

  if (!fs.availability(path)) {
    throw new Error(`unknown icon set: ${set}`);
  }

  const loaded = fs.read(path);
  const parsed = JSON.parse(loaded);
  ctx.raw[set] = parsed;
};

type IconifyJSON = Parameters<typeof iconify.utils.getIconData>[0];

export type Context = {
  coll: Record<string, Record<string, string>>;
  raw: Record<string, IconifyJSON>;
};

export const createContext = (): Context => Object.freeze({ coll: {}, raw: {} });
