/* eslint-env node, es2022 */

import type { ParsedPath as Path } from "node:path";

import path from "node:path";
import { URL } from "node:url";

import twemoji from "twemoji";

import * as fs from "./fs";
import fetch from "./fetch";
import * as html from "./html";

// converts between codepoint and raw emoji
const CODE_POINT_SEPARATER = "-";

const toCodePoint = (char: string): string =>
  twemoji.convert.toCodePoint(char, CODE_POINT_SEPARATER);

const fromCodePoint = (codePoint: string): string =>
  codePoint.split(CODE_POINT_SEPARATER).map(twemoji.convert.fromCodePoint).join("");

// supply cache directory for twemoji
const CACHE_DIRECTORY_PATH = path.parse("dist/.twemoji");

const cachePathFromCodePoint = (codePoint: string): Path =>
  path.parse(path.join(path.format(CACHE_DIRECTORY_PATH), `${codePoint}.svg`));

// supply url to twemoji api
const BASE_API_URL = new URL("https://twemoji.maxcdn.com/v/latest/svg/");

const urlFromCodePoint = (codePoint: string): URL => new URL(`${codePoint}.svg`, BASE_API_URL);

// supply svg data of emoji
export const toSVG = (char: string): string => {
  const codePoint = toCodePoint(char);
  const cachePath = cachePathFromCodePoint(codePoint);

  if (fs.availability(CACHE_DIRECTORY_PATH)) {
    fs.mkdir(CACHE_DIRECTORY_PATH);
  }

  let raw: string;
  if (fs.availability(cachePath)) {
    raw = fs.read(cachePath);
  } else {
    const url = urlFromCodePoint(codePoint);
    raw = fetch(url);
    fs.write(cachePath, raw);
  }

  const { content, attrs } = html.destructElement(raw);
  const svg = html.makeSVG(content, attrs);

  return svg;
};
