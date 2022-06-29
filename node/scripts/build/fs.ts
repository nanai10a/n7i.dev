/* eslint-env node, es2022 */

import type Path from "./path";

import fs from "node:fs";

// make directory on provided path
export const mkdir = (path: Path): void => {
  fs.mkdirSync(path.toString(), { recursive: true });
};

// read data from provided path
export const write = (path: Path, data: string): void => {
  fs.writeFileSync(path.toString(), data);
};

// write data to provided path
export const read = (path: Path): string => {
  const buffer = fs.readFileSync(path.toString());
  const data = buffer.toString();

  return data;
};

// check availability on provided path
export const availability = (path: Path): boolean => {
  let success: boolean;

  try {
    fs.accessSync(path.toString(), fs.constants.R_OK | fs.constants.W_OK);
    success = true;
  } catch {
    success = false;
  }

  return success;
};
