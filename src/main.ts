/* eslint-disable @typescript-eslint/no-explicit-any */
import P from "parsimmon";
import type { Parser } from "parsimmon"

const whitespace = P.regexp(/\s*/m);

function token(parser: Parser<unknown>) {
  return parser.skip(whitespace);
}

function word(str: string) {
  return P.string(str).thru(token);
}

export const ProtoParser = P.createLanguage({
  document: r => 
    P.alt(r.object, r.property, r.string)
      .many(),

  value: r =>
    P.alt(r.string, r.constant, r.number, r.true, r.false,),
  
  lb: () => token(P.regex(/\r\n|\r|\n/)),
  lbrace: () => word("{"),
  rbrace: () => word("}"),
  colon: () => word(":"),

  true: () => word("true").result(true),
  false: () => word("false").result(false),

  string: () =>
    token(P.regexp(/"((?:\\.|.)*?)"/, 1))
      .desc("string"),
      
  constant: () =>
    token(P.regexp(/(?:([_A-Z]+[_A-Z0-9]*))/, 1))
      .desc("constant"),

  identifier: () =>
    token(P.regexp(/[_a-zA-Z]+[_a-zA-Z0-9]*/))
      .desc("identifier"),

  number: () =>
    token(P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/))
      .map(Number)
      .desc("number"),
  
  property: r =>
    P.seq(r.identifier.skip(r.colon), r.value, r.lb.atLeast(0))
      .map(([key, value]) => ({[key]: value}))
      .desc("property"),
  
  object: r =>
    P.seq(r.identifier.skip(r.lbrace), r.document, r.rbrace)
      .map(([key, values]) => ({[key]: values}))
});

const expand = (entries: any[]) => {
  let document: any = {};
  let key: string | undefined = undefined;

  for (const entry of entries) {
    if (typeof entry === "object") {
      key = Object.keys(entry)[0];
      const value = entry[key];
      const newValue = Array.isArray(value) ? expand(value) : value;
      document[key] = (document[key] !== undefined) ? (Array.isArray(document[key]) ? [...document[key], newValue] : [document[key], newValue]) : newValue;
    } else if (typeof entry === "string" && key) {
      document = {
        ...document,
        [key]: (document[key] || "") + entry,
      }
    }
  }

  return document;
}

export const transform = (str: string) => {
  const result = ProtoParser.document.tryParse(str);
  const document = expand(result);
  return document;
}