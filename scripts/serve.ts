import * as deps from "/deps.ts";
import * as consts from "/scripts/consts.ts";

const main = async () => {
  const app = new deps.oak.Application();

  app.use(async (ctx) => {
    const root = consts.DIST_DIR;

    const parsed = deps.std.path.parse(ctx.request.url.pathname);
    parsed.base = "";
    parsed.name = parsed.name === "" ? "index" : parsed.name;
    parsed.ext = parsed.ext === "" ? ".html" : parsed.ext;

    const path = deps.std.path.format(parsed);

    await ctx.send({ root, path });
  });

  await app.listen({ hostname: "0.0.0.0", port: 3000 });
  return 0;
};

import.meta.main ? Deno.exit(await main()) : undefined;
