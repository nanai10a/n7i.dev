import * as deps from "/deps.ts";

const SOURCE_FILES = "pages/**/*.pug";
const DIST_DIR = "dist";

const CSS_INJECT_POINT = "__css_href_inject__";

const TWIND_CFG = {
  // hash: true, // TODO: improves size?
  preflights: true,
  presets: [deps.twind.preset.autoprefix(), deps.twind.preset.tailwind()],
};

const main = async () => {
  const glob = new deps.glob.Glob(SOURCE_FILES, { sync: true });
  const expand = glob.found;

  const tw = deps.twind.setup(TWIND_CFG);

  const prepares = expand
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

  const building = (await Promise.all(prepares))
    // => [dest path, write data] (flatten)
    .flat()
    // => [writing promsise, dest path]
    .map(([path, str]) => [Deno.writeTextFile(path, str), path] as const)
    // assert that's html
    .filter(([_, path]) => deps.std.path.parse(path).ext === ".html")
    // => [void, packup promise]
    .map(async ([pm, path]) => [
      await pm,
      await deps.packup.cli.main(["build", path]),
    ]);

  await Promise.all(building);
};

const asDist = (path: string, ext: string): string => {
  const parsed = deps.std.path.parse(path);

  const removed = parsed.dir.split(deps.std.path.SEP_PATTERN).slice(1);

  parsed.dir = deps.std.path.join(DIST_DIR, ...removed);
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
  html.replace(CSS_INJECT_POINT, deps.std.path.join("/", link));

const atPath = (path: string): string => {
  const parsed = deps.std.path.parse(path);
  const removed = parsed.dir.split(deps.std.path.SEP_PATTERN).slice(1);
  parsed.dir = deps.std.path.join(...removed);

  return deps.std.path.format(parsed);
};

const mkDistDir = async () => {
  try {
    await Deno.mkdir(DIST_DIR);
  } catch (e) {
    if (!(e instanceof Deno.errors.AlreadyExists)) {
      throw e;
    }
  }
};

if (import.meta.main) {
  Deno.exit(await main());
}
