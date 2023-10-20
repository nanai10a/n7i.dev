import * as brotli from "brotli/mod.ts";
import * as glob from "glob";
import * as oak from "oak/mod.ts";
import * as pako from "pako/pako.js";
import * as pug from "pug/mod.ts";

import * as packup_cli from "packup/cli.ts";
const packup = {
  cli: packup_cli,
};

import * as twind_mod from "@twind/core";
import twind_preset_autoprefix_mod from "@twind/preset-autoprefix";
import twind_preset_tailwind_mod from "@twind/preset-tailwind";
const twind = {
  ...twind_mod,
  preset: {
    autoprefix: twind_preset_autoprefix_mod,
    tailwind: twind_preset_tailwind_mod,
  },
};

import * as std_path from "std/path/mod.ts";
import { crypto as std_crypto } from "std/crypto/mod.ts";
import * as std_encoding_base64url from "std/encoding/base64url.ts";
const std = {
  path: std_path,
  crypto: std_crypto,
  encoding: {
    base64url: std_encoding_base64url,
  },
};

export { brotli, glob, oak, packup, pako, pug, twind, std };
