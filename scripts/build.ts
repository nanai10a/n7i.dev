/* eslint-env node, es2022 */

import child_process from "child_process";
import esbuild from "esbuild";
import fs from "fs/promises";
import path from "path";
import pug from "pug";
import cssnano from "cssnano";
import postcss from "postcss";
import chokidar from "chokidar";
import crypto from "crypto";
import posthtml from "posthtml";

// eslint-disable-next-line @typescript-eslint/no-var-requires -- doesn't exists `.d.ts`
const htmlnano = require("htmlnano");

const MAIN_CSS_FILEPATH = "styles/main.css";
const FS_OPTS = { encoding: "utf-8" as const };

const watch = async () => {
  const boot = await watchFiles();
  boot(async (filepath) => {
    console.log(`👀 changed => ${filepath}`);

    switch (getExt(filepath)) {
      case ".pug":
        {
          const partialhtml = await buildPug(filepath, {});

          const tailwindcss = await fs.readFile(MAIN_CSS_FILEPATH, FS_OPTS);
          const css = await buildTailwindcss(tailwindcss, partialhtml);
          const mincss = await minifyCssnano(css);

          const html = await buildPug(filepath, { __tailwindcss__: mincss });
          const minhtml = await minifyHtmlnano(html);

          await fs.writeFile(asDist(chExt(filepath, ".html")), minhtml, FS_OPTS);
        }
        break;

      case ".css":
        {
          console.error("ignored file.");
        }
        break;

      case ".ts":
        {
          console.error("ignored file.");
        }
        break;
    }

    console.error("non-target file.");
  });
};

const buildPug = async (filepath: Path, locals: Locals) => {
  console.log(`🏗️ build(pug) <= ${filepath}`);

  const opts = {
    basedir: process.cwd(),
    filters: filters,
  };
  const template = pug.compileFile(filepath, opts);

  locals = { __tailwindcss__: "", ...locals };
  const html = template(locals);

  return html;
};

type Locals = Partial<{ __tailwindcss__: string }>;

const filters = {
  twemoji: () => {
    throw new Error("unimplemented.");
  },

  iconify: () => {
    throw new Error("unimplemented.");
  },
};

const buildTailwindcss = async (src: Code, content: Code): Promise<Code> => {
  console.log("🏗️ build(tailwindcss) <=");

  const tmpdir = await genTmpdir();

  const cssfile: Path = path.join(tmpdir, "in.css");
  const htmlfile: Path = path.join(tmpdir, "in.html");
  const outcssfile: Path = path.join(tmpdir, "out.css");

  const writingcss = fs.writeFile(cssfile, src, FS_OPTS);
  const writinghtml = fs.writeFile(htmlfile, content, FS_OPTS);
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

  const css = await fs.readFile(outcssfile, FS_OPTS);

  fs.rm(tmpdir, { recursive: true });
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
  const uuid = crypto.randomUUID();
  const tmpdir = path.join("dist", ".tmp", uuid);

  await fs.mkdir(tmpdir, { recursive: true });

  return tmpdir;
};

// --- --- --- --- --- --- --- --- ---

console.log(`💨 cwd => ${process.cwd()}`);
watch();
