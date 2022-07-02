import * as deps from "/deps.ts";
import * as consts from "/scripts/consts.ts";

const TWIND_CFG = {
  // hash: true, // TODO: improves size?
  preflights: true,
  presets: [deps.twind.preset.autoprefix(), deps.twind.preset.tailwind()],
};

const main = async () => {
  const glob = new deps.glob.Glob(consts.SOURCE_FILES, { sync: true });
  const expand = glob.found;

  const tw = deps.twind.setup(TWIND_CFG);

  const preparings = expand
    // => [source path, rendered result]
    .map((path) => [path, deps.pug.renderFile(path)] as const)
    // assert that's string
    .filter(([_, html]) => typeof html === "string")
    // => [...] (cast only)
    .map((turple) => turple as [string, string])
    // => [..., { rendered html, extracted css }]
    .map(([path, html]) => [path, deps.twind.extract(html, tw)] as const)
    // => [
    //   [path to dist of html, rendered html],
    //   [path to dist of css, extracted css],
    // ]
    .map(
      async ([path, { html, css }]) =>
        [
          [asDist(path, ".html"), html],
          [asDist(await addHash(path, css), ".css"), css],
        ] as const
    )
    // => [[..., html injected link to css], [...]]
    .map(
      async (turple) =>
        [
          [
            (await turple)[0][0],
            addCss((await turple)[0][1], atPath((await turple)[1][0])),
          ],
          (await turple)[1],
        ] as const
    );

  await mkDistDir();

  const [paths, strs] = (await Promise.all(preparings))
    // => [dest path, write data] (flatten)
    .flat()
    // => [(dest path)[], (write data)[]]
    .reduce(
      ([paths, strs], [path, str]) =>
        [
          [...paths, path],
          [...strs, str],
        ] as const,
      [[], []] as readonly [readonly string[], readonly string[]]
    );

  const buildings = paths
    // => [writing promsise, dest path]
    .map((path, idx) => [Deno.writeTextFile(path, strs[idx]), path] as const)
    // assert that's html
    .filter(([_, path]) => deps.std.path.parse(path).ext === ".html")
    // => [void, packup promise]
    .map(([pm, path]) => pm.then(() => deps.packup.cli.main(["build", path])));

  const result = { success: 0, failed: 0 };
  for await (const code of buildings) {
    code === 0 ? result.success++ : result.failed++;
  }

  console.log("\n--- --- --- --- --- --- --- --- ---\n");

  console.log(`packup: success - ${result.success}, failed - ${result.failed}`);

  const builts = [] as string[];
  const walk = async (dir: string) => {
    for await (const path of Deno.readDir(dir)) {
      if (path.isDirectory) {
        await walk(path.name);
      } else if (
        path.isFile &&
        !path.name.endsWith(".br") &&
        !path.name.endsWith(".gz")
      ) {
        builts.push(deps.std.path.join(consts.DIST_DIR, path.name));
      }
    }
  };
  await walk(consts.DIST_DIR);

  const encoder = new TextEncoder();
  const compressings = builts
    .map((path) => Deno.readTextFile(path))
    .map(async (text) => encoder.encode(await text))
    .map(
      (byte) =>
        [
          (async () =>
            deps.brotli.compress(await byte, undefined, 11, undefined))(),
          (async () =>
            deps.pako.gzip(await byte, { level: 9 }) as Uint8Array)(),
        ] as const
    )
    .map(
      ([br, gz], idx) =>
        [
          [builts[idx] + ".br", br],
          [builts[idx] + ".gz", gz],
        ] as const
    )
    .flat()
    .map(async ([path, compressing]) =>
      Deno.writeFile(path, await compressing)
    );

  const files = (await Promise.all([...compressings])).length / 2;

  console.log("\n--- --- --- --- --- --- --- --- ---\n");
  console.log(`compressed: ${files} files (.br & .gz)`);

  return Number(result.failed !== 0);
};

const asDist = (path: string, ext: string): string => {
  const parsed = deps.std.path.parse(path);

  const removed = parsed.dir.split(deps.std.path.SEP_PATTERN).slice(1);

  parsed.dir = deps.std.path.join(consts.DIST_DIR, ...removed);
  parsed.base = "";
  parsed.ext = ext;

  return deps.std.path.format(parsed);
};

const addHash = async (path: string, data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const rawData = encoder.encode(data);
  const rawHash = await deps.std.crypto.subtle.digest("KECCAK-224", rawData);
  const encoded = deps.std.encoding.base64url.encode(rawHash);

  const parsed = deps.std.path.parse(path);
  parsed.base = "";
  parsed.name = parsed.name + "." + encoded;

  return deps.std.path.format(parsed);
};

const addCss = (html: string, link: string): string =>
  html.replace(consts.CSS_INJECT_POINT, deps.std.path.join("/", link));

const atPath = (path: string): string => {
  const parsed = deps.std.path.parse(path);
  const removed = parsed.dir.split(deps.std.path.SEP_PATTERN).slice(1);
  parsed.dir = deps.std.path.join(...removed);

  return deps.std.path.format(parsed);
};

const mkDistDir = async () => {
  try {
    await Deno.mkdir(consts.DIST_DIR);
  } catch (e) {
    if (!(e instanceof Deno.errors.AlreadyExists)) {
      throw e;
    }
  }
};

import.meta.main ? Deno.exit(await main()) : undefined;
