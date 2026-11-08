/**
 * V2 data-format contract vectors. Calls the real parser in src/, so a future
 * V3 reader must either keep these behaviours or migrate them deliberately.
 * See schema/v2.md for the written contract.
 *
 *   npm run test:schema
 */
import { parseCardMemo, cardLangValue, cardPresentLangs } from '../src/card-model.js';
import { parseSpaceHeader } from '../src/spaces.js';

const cases = [
  ['explicit full + tags', '{"_t":"lc","v":2,"ja":"neko","en":"cat","zh":"mao"}\n#vocab #daily', true, ['#vocab', '#daily'], ['ja', 'en', 'zh']],
  ['explicit minimal', '{"_t":"lc","v":2,"en":"serendipity"}', true, [], ['en']],
  ['new language only (fr)', '{"_t":"lc","v":2,"fr":"bonjour"}', false, [], []],
  ['empty language value', '{"_t":"lc","v":2,"en":""}', false, [], []],
  ['wrong _t', '{"_t":"other","v":2,"en":"x"}', false, [], []],
  ['legacy: v + en, no _t', '{"v":2,"en":"legacy"}', true, [], ['en']],
  ['neither _t nor v', '{"en":"x"}', false, [], []],
  ['v as string + legacy jp/cn keys', '{"_t":"lc","v":"2","jp":"neko","cn":"mao"}', true, [], ['ja', 'zh']],
  ['v:3 still accepted by V2 reader', '{"_t":"lc","v":3,"en":"future"}', true, [], ['en']],
  ['header only + tail tag', '{"_t":"lc","v":2}\n#vocab', true, ['#vocab'], []],
  ['surrounding prose', 'note: {"_t":"lc","v":2,"en":"x"} end #t1', true, ['#t1'], ['en']],
  ['broken JSON, regex fallback', '{"_t":"lc","v":2,"en":"x",}', true, [], ['en']],
  ['numeric language value', '{"_t":"lc","v":2,"en":123}', true, [], ['en']],
  ['comma-separated tail tags', '{"_t":"lc","v":2,"en":"x"} #a,#b', true, ['#a,', '#b'], ['en']],
  ['array payload', '["x"]', false, [], []]
];

const spaces = [
  ['canonical header', '{"_t":"lc","v":2}', true],
  ['header with v:3', '{"_t":"lc","v":3}', true],
  ['header inside prose', 'my cards {"_t":"lc","v":2} the end', true],
  ['wrong _t', '{"_t":"other","v":2}', false],
  ['broken JSON', '{"_t":"lc"', false]
];

let failures = 0;
for (const [name, raw, valid, tags, langs] of cases) {
  const parsed = parseCardMemo(raw, null);
  const gotValid = Boolean(parsed);
  const gotTags = parsed ? parsed.tags : [];
  const gotLangs = parsed ? cardPresentLangs(parsed.data) : [];
  const ok = gotValid === valid
    && JSON.stringify(gotTags) === JSON.stringify(tags)
    && JSON.stringify(gotLangs) === JSON.stringify(langs);
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}: valid=${gotValid} tags=${JSON.stringify(gotTags)} langs=${JSON.stringify(gotLangs)}`);
  }
}

for (const [name, description, expected] of spaces) {
  const got = Boolean(parseSpaceHeader(description));
  if (got !== expected) {
    failures++;
    console.error(`FAIL space ${name}: match=${got}, expected ${expected}`);
  }
}

if (cardLangValue({ en: 123 }, 'en') !== '123') {
  failures++;
  console.error('FAIL non-string language values must be stringified');
}

const total = cases.length + spaces.length + 1;
if (failures) {
  console.error(`${failures}/${total} V2 contract vectors failed.`);
  process.exitCode = 1;
} else {
  console.log(`${total}/${total} V2 contract vectors passed.`);
}
