/* eslint-env node, es2022 */

import type { HTMLElement } from "node-html-parser";

import htmlparser from "node-html-parser";

// wrap node-html-parser for usability
const parseHTML = (...args: Parameters<typeof htmlparser>) =>
  htmlparser(...args).firstChild as HTMLElement;

// indicate what is for
type HTML = string;
type Attributes = Record<string, string>;

// don't allow other values on this attributes
const FORCE_ATTRIBUTES: Attributes = {
  // specify namespace
  xmlns: "http://www.w3.org/2000/svg",
  // indicate element is image
  role: "img",
};

// fill attributes with this if empty
const DEFAULT_ATTRIBUTES: Attributes = {
  // certainly recommend this
  ...FORCE_ATTRIBUTES,
  // size is same of around elements
  width: "1em",
  height: "1em",
};

// make data in advance because use frequently
const EMPTY_SVG_ELEMENT: HTMLElement = parseHTML("<svg>");

// make attributes as desired
export const makeAttributes = (src: Attributes): Attributes => {
  const made = {
    ...DEFAULT_ATTRIBUTES,
    ...src,
    ...FORCE_ATTRIBUTES,
  };

  return made;
};

// make svg data as desired
export const makeSVG = (content: HTML, attrs: Attributes): HTML => {
  const svg = EMPTY_SVG_ELEMENT.clone() as HTMLElement;

  const madeAttrs = makeAttributes(attrs);

  svg.setAttributes(madeAttrs);

  const inner = parseHTML(content).firstChild as HTMLElement;
  svg.appendChild(inner);

  const made = svg.toString();

  return made;
};

// destruct html data to attributes and inner html
export const destructElement = (element: HTML): { attrs: Attributes; content: HTML } => {
  const { attributes, innerHTML } = parseHTML(element);

  return {
    attrs: attributes,
    content: innerHTML,
  };
};
