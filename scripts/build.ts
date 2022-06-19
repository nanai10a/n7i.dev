/* eslint-env node, es2022 */

import type { HTMLElement } from "node-html-parser";

import child_process from "node:child_process";
import esbuild from "esbuild";
import fsp from "node:fs/promises";
import { constants as fsc } from "node:fs";
import path from "node:path";
import pug from "pug";
import cssnano from "cssnano";
import postcss from "postcss";
import chokidar from "chokidar";
import crypto from "node:crypto";
import posthtml from "posthtml";
import twemoji from "twemoji";
import * as htmlparser from "node-html-parser";
import * as iconify_json from "@iconify/json";
import * as iconify_utils from "@iconify/utils";
const iconify = { json: iconify_json, utils: iconify_utils };
import { URL } from "node:url";

// eslint-disable-next-line @typescript-eslint/no-var-requires -- doesn't exists type definitions
const htmlnano = require("htmlnano");

const MAIN_CSS_FILEPATH = "styles/main.css";
const FS_OPTS = { encoding: "utf-8" as const };
const SVG_ATTRIBUTES = {
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  role: "img",
  width: "1em",
  height: "1em",
  preserveAspectRatio: "xMidYMid meet",
  viewBox: "0 0 24 24",
};
const TWEMOJI_BASE_URL = "https://twemoji.maxcdn.com/v/latest/svg/";

const watch = async () => {
  const boot = await watchFiles();
  boot(async (filepath) => {
    console.log(`👀 changed => ${filepath}`);

    switch (getExt(filepath)) {
      case ".pug": {
        const partialhtml = await buildPug(filepath, {
          __injected__: { tailwindcss: "", twemoji: () => "", iconify: () => "" },
        });

        const tailwindcss = await fsp.readFile(MAIN_CSS_FILEPATH, FS_OPTS);
        const css = await buildTailwindcss(tailwindcss, partialhtml);
        const mincss = await minifyCssnano(css);

        const html = await buildPug(filepath, {
          __injected__: { tailwindcss: mincss, twemoji: () => "", iconify: () => "" },
        });
        const minhtml = await minifyHtmlnano(html);

        const dest = asDist(chExt(filepath, ".html"));
        await fsp.writeFile(dest, minhtml, FS_OPTS);

        console.log(`✅ built html => ${dest}`);

        return;
      }

      default: {
        console.log("😌 nothing to do");

        return;
      }
    }
  });
};

const buildPug = async (filepath: Path, locals: Locals) => {
  console.log(`🏗️ build(pug) <= ${filepath}`);

  const opts = {
    basedir: process.cwd(),
  };
  const template = pug.compileFile(filepath, opts);

  const html = template(locals);

  return html;
};

type Locals = {
  __injected__: {
    tailwindcss: string;
    twemoji: (_char: string, _attrs: Record<string, string>) => string;
    iconify: (_set: string, _name: string, _attrs: Record<string, string>) => string;
  };
};

const filterTwemoji = async (char: string, attrs: Record<string, unknown>) => {
  console.log("⚗️ try injection(twemoji)");

  const codepoint = twemoji.convert.toCodePoint(char);
  const filename = `${codepoint}.svg`;
  const fileurl = new URL(filename, TWEMOJI_BASE_URL);

  const cachepath = `dist/.twemoji/${codepoint}.svg`;
  let exists: boolean;
  try {
    await fsp.access(cachepath, fsc.R_OK);
    exists = true;
  } catch {
    exists = false;

    const opts = { recursive: true };
    await fsp.mkdir("dist/.twemoji", opts);
  }

  let svg: string;
  if (exists) {
    svg = await fsp.readFile(cachepath, FS_OPTS);
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- typescript cannot recognize node fetch api
    // @ts-ignore
    const response = await fetch(fileurl);
    if (response.status !== 200) {
      throw new Error("failed to fetch svg of twemoji");
    }

    svg = await response.text();

    // Tips: doesn't need await this: do caching
    fsp.writeFile(cachepath, svg, FS_OPTS);
  }

  const element = htmlparser.parse(svg);

  const strattrs = mapObjectAsString(attrs);
  const holdattrs = (element.firstChild as HTMLElement).attributes;
  const passattrs = {
    ...SVG_ATTRIBUTES,
    ...strattrs,
    ...holdattrs,
    width: "1.2em",
    height: "1.2em",
    class: "mr-[.05em] ml-[.1em] align-[-.2em] inline",
  };
  (element.firstChild as HTMLElement).setAttributes(passattrs);
  svg = element.toString();

  console.log("⤵️ inject(twemoji)");

  return svg;
};

const filterIconify = async (set: string, name: string, attrs: Record<string, unknown>) => {
  console.log("⚗️ try injection(iconify)");

  const setpath = iconify.json.locate(set);
  // replace for cache:
  // const setdata = await import(setpath);
  const setjson = (await fsp.readFile(setpath)).toString();
  const setdata = JSON.parse(setjson);

  const icon = iconify.utils.getIconData(setdata, name, false);
  if (icon === null) {
    return;
  }

  const content = htmlparser.parse(icon.body);
  const element = htmlparser.parse("<svg></svg>");

  const strattrs = mapObjectAsString(attrs);
  const passattrs = Object.assign(SVG_ATTRIBUTES, strattrs);

  (element.firstChild as HTMLElement).setAttributes(passattrs);
  (element.firstChild as HTMLElement).appendChild(content);

  const svg = element.toString();

  console.log("⤵️ inject(iconify)");

  return svg;
};

const buildTailwindcss = async (src: Code, content: Code): Promise<Code> => {
  console.log("🏗️ build(tailwindcss) <=");

  const tmpdir = await genTmpdir();

  const cssfile: Path = path.join(tmpdir, "in.css");
  const htmlfile: Path = path.join(tmpdir, "in.html");
  const outcssfile: Path = path.join(tmpdir, "out.css");

  const writingcss = fsp.writeFile(cssfile, src, FS_OPTS);
  const writinghtml = fsp.writeFile(htmlfile, content, FS_OPTS);
  await Promise.all([writingcss, writinghtml]);

  const spawned = child_process.spawn(toBin("tailwindcss"), [
    "--input",
    cssfile,
    "--content",
    htmlfile,
    "--output",
    outcssfile,
    "--minify",
  ]);

  await new Promise((resolve, reject) => {
    spawned.once("exit", (code) => (code === null ? reject() : resolve(code)));
    spawned.once("error", (err) => reject(err));
  });

  const css = await fsp.readFile(outcssfile, FS_OPTS);

  // Tips: doesn't need await this: clean up temporary directory
  fsp.rm(tmpdir, { recursive: true });
  return css;
};

const minifyEsbuild = async (src: Code): Promise<Code> => {
  console.log("🗜️ optimize(esbuild) <=");

  const opts = {
    charset: "utf8" as const,
    loader: "js" as const,
    minify: true,
    target: ["browser", "es2022"],
  };
  const { code } = await esbuild.transform(src, opts);

  return code;
};

const minifyHtmlnano = async (src: Code): Promise<Code> => {
  console.log("🗜️ optimize(htmlnano) <=");

  const opts = {
    collapseWhitespace: "aggressive",
    minifyCss: false, // Tips: if this enabled, postcss inside htmlnano throws about cannot recognize properties prefixed `-webkit` .
  };
  const { html } = await posthtml([htmlnano(opts, htmlnano.presets.max)]).process(src);

  return html;
};

const minifyCssnano = async (src: Code): Promise<Code> => {
  console.log("🗜️ optimize(cssnano) <=");

  const opts = {
    preset: "advanced",
  };
  const { css } = await postcss(cssnano(opts)).process(src, {
    from: undefined,
  });

  return css;
};

const watchFiles = async () => (listener: (_: Path) => unknown) => {
  console.log("🚧 booting chokidar");

  const watcher = chokidar.watch(["mixins", "pages", "scripts", "styles"]);

  watcher.on("ready", () => console.log("🧐 watching files"));
  watcher.on("change", listener);
};

type Path = string;
type Extension = string;
type Code = string;

const chExt = (src: Path, to: Extension): Path => src.replace(path.parse(src).ext, to);

const getExt = (src: Path): Extension => path.parse(src).ext;

const toBin = (name: string): Path => path.join("node_modules/.bin", name);

const asDist = (src: Path): Path => {
  const splitted = src.split(path.sep);

  splitted[0] = "dist";
  const modified = splitted.reduce((previous, current) => previous + path.sep + current);

  return modified;
};

const genTmpdir = async (): Promise<Path> => {
  console.log("🗃️ make temporary dir");

  const uuid = crypto.randomUUID();
  const tmpdir = path.join("dist", ".tmp", uuid);

  await fsp.mkdir(tmpdir, { recursive: true });

  return tmpdir;
};

const mapObjectAsString = (obj: Record<string, unknown>): Record<string, string> => {
  const entries = Object.entries(obj);
  const mapped = entries.map(([key, val]) => {
    let strval: string;

    if (typeof val === "string") {
      strval = val;
    } else if (typeof val === "object" && "toString" in val) {
      strval = val.toString();
    } else {
      strval = String(val);
    }

    return [key, strval];
  });
  const restructed = Object.fromEntries(mapped);

  return restructed;
};

// --- --- --- --- --- --- --- --- ---

console.log(`💨 cwd => ${process.cwd()}`);
watch();
