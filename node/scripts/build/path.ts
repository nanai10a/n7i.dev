import type { ParsedPath } from "node:path";

import { parse, format, normalize } from "node:path";

export class Path implements ParsedPath {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;

  constructor(path: string) {
    const normalized = normalize(path);
    const obj = parse(normalized);

    this.root = obj.root;
    this.dir = obj.dir;
    this.base = obj.base;
    this.ext = obj.ext;
    this.name = obj.name;
  }

  toString(): string {
    return format(this);
  }
}

export default Path;
