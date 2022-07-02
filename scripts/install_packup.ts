import * as deps from "/deps.ts";

await Deno.mkdir(deps.packup.install_util.wasmCacheDir(), { recursive: true });
await deps.packup.install_util.installWasm();
