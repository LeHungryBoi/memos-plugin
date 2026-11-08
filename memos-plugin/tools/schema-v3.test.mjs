/**
 * V3 data contract vectors: space markers, card type normalization,
 * V3 note payloads, explanation modes, alias mapping and migration.
 *
 *   npm run test:v3
 */
import {
  extractMarker, normalizeType, defaultType, markerFromType, sortTypes,
  sectionKeys, activeTypeForNew, valueForSection, mapSectionKeys
} from '../src/card-types.js';
import {
  parseCardV3, parseAnyCard, buildCardContentV3, valuesFor, explanationsFor
} from '../src/card-model.js';
import { migratedContent } from '../src/space-manager.js';

let failures = 0;
function check(name, condition, detail) {
  if (!condition) {
    failures++;
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const space = { name: 'spaces/new-speak', title: 'New Speak Space' };
const newSpeak = normalizeType({
  _t: 'lc', v: 3,
  typeId: 'new-speak', name: 'New Speak', order: 20,
  explanationMode: 'global',
  sections: [
    { key: 'en', label: 'English', code: 'EN', color: '#38bdf8' },
    { key: 'newSpeak', label: 'New Speak', code: 'NS', color: '#34d399' }
  ],
  sectionAliases: { personal: 'in room' }
}, space);

check('V3 marker recognized', Boolean(extractMarker(`prose ${markerFromType(newSpeak)} tail`)));
check('wrong _t rejected', extractMarker('{"_t":"other","v":3}') === null);
check('broken marker rejected', extractMarker('{"_t":"lc"') === null);
check('custom sections', eq(sectionKeys(newSpeak), ['en', 'newSpeak']));
check('global explanation mode', newSpeak.explanationMode === 'global');
check('alias declared', newSpeak.sectionAliases.personal === 'in room');
check('alias lookup', valueForSection({ personal: 'hi' }, newSpeak, 'in room') === 'hi');

const roundTrip = normalizeType(JSON.parse(markerFromType(newSpeak)), space);
check('marker round trip', eq(sectionKeys(roundTrip), sectionKeys(newSpeak)));
check('code derived from label, not stored', (() => {
  const obj = JSON.parse(markerFromType(newSpeak));
  return !('code' in obj.sections[0])
    && roundTrip.sections.find(s => s.key === 'newSpeak').code === 'NS';
})());
check('marker keeps order', roundTrip.order === 20);
check('marker keeps aliases', roundTrip.sectionAliases.personal === 'in room');

const legacyType = normalizeType({ _t: 'lc', v: 2 }, { name: 'spaces/legacy', title: 'Legacy' });
check('V2 marker becomes default type', legacyType.version === 2 && sectionKeys(legacyType).length === 3);
check('unmarked default type', sectionKeys(defaultType(null)).length === 3);
check('stock JA hidden by default (V2 behaviour)', defaultType(null).sections.find(s => s.key === 'ja').defaultHidden === true);
check('defaultHidden round trip', (() => {
  const t = normalizeType({
    _t: 'lc', v: 3, typeId: 'h', name: 'H', order: 1, explanationMode: 'per-section',
    sections: [
      { key: 'ja', label: '日本語', color: '#f472b6', defaultHidden: true },
      { key: 'en', label: 'English' }
    ]
  }, { name: 'spaces/h', title: 'H' });
  const obj = JSON.parse(markerFromType(t));
  const again = normalizeType(obj, { name: 'spaces/h', title: 'H' });
  return t.sections[0].defaultHidden === true
    && t.sections[1].defaultHidden === false
    && again.sections[0].defaultHidden === true
    && obj.sections[1].defaultHidden === undefined;
})());
check('declared type keeps empty sections', (() => {
  const empty = normalizeType({
    _t: 'lc', v: 3, typeId: 'blank', name: 'Blank', order: 5,
    explanationMode: 'per-section', sections: []
  }, { name: 'spaces/blank', title: 'Blank' });
  return sectionKeys(empty).length === 0;
})());
check('sort by order', eq(sortTypes([newSpeak, legacyType]).map(t => t.order), [0, 20]));
check('active type by order', activeTypeForNew([newSpeak, legacyType], null).id === legacyType.id);
check('active type by URL space', activeTypeForNew([newSpeak, legacyType], 'spaces/new-speak').id === 'new-speak');

const perSection = normalizeType({
  _t: 'lc', v: 3, typeId: 'per', name: 'Per', order: 1,
  explanationMode: 'per-section',
  sections: [{ key: 'en' }, { key: 'zh' }]
}, { name: 'spaces/per', title: 'Per' });

const built = buildCardContentV3(
  perSection,
  { en: 'cat', zh: '猫' },
  { en: 'an animal', zh: '一种动物' },
  true,
  '#vocab, #daily'
);
const parsed = parseCardV3(built.content);
check('V3 payload parses', Boolean(parsed));
check('V3 version detected', parsed.version === 3 && parseAnyCard(built.content).version === 3);
check('section values', eq(valuesFor(parsed, perSection), { en: 'cat', zh: '猫' }));
check('per-section explanations', eq(explanationsFor(parsed, perSection), { en: 'an animal', zh: '一种动物' }));
check('tags normalized', eq(parsed.tags, ['#vocab', '#daily']));
check('definitions never stored in note',
  !/sections|explanationMode|"order"|"label"/.test(built.content));
check('V2 reader still sees the card', parseAnyCard('{"_t":"lc","v":2,"en":"x"}').version === 2);

const hidden = buildCardContentV3(perSection, { en: 'x' }, { en: 'note' }, false, '');
check('hidden explanation flag', JSON.parse(hidden.content)._x === false);
check('hidden explanation keeps value', parseCardV3(hidden.content).showExplanation === false);
check('global explanation string', (() => {
  const b = buildCardContentV3(newSpeak, { en: 'x' }, 'shared note', true, '');
  return explanationsFor(parseCardV3(b.content), newSpeak) === 'shared note';
})());
check('empty card rejected', parseCardV3('{"_t":"lc","v":3}') === null);
check('wrong version rejected', parseCardV3('{"_t":"lc","v":2,"en":"x"}') === null);

const mapped = mapSectionKeys(
  { _t: 'lc', v: 2, personal: 'x', _e: { personal: 'note' }, other: 'keep' },
  { personal: 'in room' }
);
check('migration renames section keys only', eq(mapped, {
  _t: 'lc', v: 2, 'in room': 'x', _e: { 'in room': 'note' }, other: 'keep'
}));
const migrated = migratedContent(
  '{"_t":"lc","v":2,"personal":"x","_e":{"personal":"note"}}\n#tag',
  { personal: 'in room' }
);
check('migration keeps tail tags', migrated.endsWith('\n#tag'));
check('migration bumps v to 3', JSON.parse(migrated.split('\n')[0]).v === 3);
check('migration keeps mapped value', JSON.parse(migrated.split('\n')[0])['in room'] === 'x');

if (failures) {
  console.error(`${failures} V3 contract check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('V3 contract checks passed (marker, payload, explanations, migration).');
}
