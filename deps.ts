import * as pug from "pug/mod.ts";
import glob from "glob/glob.js";

import * as packup_cli from "packup/cli.ts";
import * as packup_install_util from "packup/install_util.ts";
const packup = {
  cli: packup_cli,
  install_util: packup_install_util,
};

import * as twind_mod from "twind/twind.js";
import twind_preset_autoprefix_mod from "@twind/preset-autoprefix/preset-autoprefix.js";
import twind_preset_tailwind_mod from "@twind/preset-tailwind/preset-tailwind.js";
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

export { glob, packup, pug, twind, std };
