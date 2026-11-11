/**
 * V3 data contract vectors: space markers, card type normalization,
 * V3 note payloads, explanation modes, alias mapping and migration.
 *
 *   npm run test:v3
 */
import {
  extractMarker, normalizeType, defaultType, markerFromType, sortTypes,
  sectionKeys, incompatibleSectionKeys, activeTypeForNew, valueForSection, mapSectionKeys
} from '../src/card-types.js';
import {
  parseCardV3, parseAnyCard, buildCardContentV3, valuesFor, explanationsFor,
  sectionExplanationsFor, unifiedExplanationFor, buildV3Migration
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
const humanType = normalizeType({
  _t: 'lc', v: 3, sections: [
    { key: 'hu', label: 'Human', color: '#34d399' },
    { key: 'newSpeak', label: 'New Speak', color: '#38bdf8' }
  ]
}, space);
check('old en section values are migration candidates after rename', eq(
  incompatibleSectionKeys({ _t: 'lc', v: 3, en: 'human', newSpeak: 'new word', _s: ['en', 'newSpeak'] }, humanType),
  ['en']
));
check('recognized hu section values are not migration candidates', eq(
  incompatibleSectionKeys({ hu: 'human', newSpeak: 'new word' }, humanType),
  []
));
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
  '#vocab, #daily',
  ['en', 'zh'],
  'A shared note'
);
const parsed = parseCardV3(built.content);
check('V3 payload parses', Boolean(parsed));
check('V3 version detected', parsed.version === 3 && parseAnyCard(built.content).version === 3);
check('section values', eq(valuesFor(parsed, perSection), { en: 'cat', zh: '猫' }));
check('per-section explanations', eq(explanationsFor(parsed, perSection), { en: 'an animal', zh: '一种动物' }));
check('unified explanation', unifiedExplanationFor(parsed) === 'A shared note');
check('visible sections persisted', eq(parsed.enabledSections, ['en', 'zh']));
check('tags normalized', eq(parsed.tags, ['#vocab', '#daily']));
check('definitions never stored in note',
  !/sections|explanationMode|"order"|"label"/.test(built.content));
check('V2 reader still sees the card', parseAnyCard('{"_t":"lc","v":2,"en":"x"}').version === 2);
const quotedType = normalizeType({
  _t: 'lc', v: 3, typeId: 'quoted', name: 'Quoted', order: 2,
  explanationMode: 'per-section',
  sections: [{ key: 'en', label: 'English' }]
}, { name: 'spaces/quoted', title: 'Quoted' });
const quotedContent = buildCardContentV3(
  quotedType, { en: 'Say "hello"' }, { en: 'She said "yes"' }, true, '', ['en'], 'Use "quotes"'
).content;
const markdownRenderedContent = quotedContent.replace(/\\(["'])/g, '$1');
check('V3 quote escapes survive Markdown and preserve values', (() => {
  const parsedQuoted = parseCardV3(markdownRenderedContent);
  return Boolean(parsedQuoted)
    && parsedQuoted.values.en === 'Say "hello"'
    && sectionExplanationsFor(parsedQuoted, quotedType).en === 'She said "yes"'
    && unifiedExplanationFor(parsedQuoted, quotedType) === 'Use "quotes"';
})());
const v2ForMigration = parseAnyCard('{"_t":"lc","v":2,"en":"cat","jp":"猫"}\n#vocab');
const migratedV2 = buildV3Migration(v2ForMigration, perSection);
check('V2 migration creates V3 content', parseCardV3(migratedV2.content).version === 3);
check('V2 migration preserves values and tags', (() => {
  const parsedMigration = parseCardV3(migratedV2.content);
  return parsedMigration.values.en === 'cat'
    && parsedMigration.values.ja === '猫'
    && eq(parsedMigration.tags, ['#vocab'])
    && eq(parsedMigration.enabledSections, ['en', 'ja']);
})());
const aliasMigration = buildV3Migration(
  parseAnyCard('{"_t":"lc","v":2,"en":"cat","oldZh":"猫"}'),
  { ...perSection, sectionAliases: { oldZh: 'zh' } }
);
check('V2 migration applies declared section aliases', parseCardV3(aliasMigration.content).values.zh === '猫');

const hidden = buildCardContentV3(
  perSection, { en: 'x' }, { en: 'note' }, false, '', ['en'], 'shared'
);
check('hidden explanation flag', JSON.parse(hidden.content)._x === false);
check('hidden explanation keeps value', parseCardV3(hidden.content).showExplanation === false);
check('hidden section state and explanations persist', (() => {
  const parsedHidden = parseCardV3(hidden.content);
  return eq(parsedHidden.enabledSections, ['en'])
    && eq(sectionExplanationsFor(parsedHidden, perSection), { en: 'note', zh: '' })
    && unifiedExplanationFor(parsedHidden) === 'shared';
})());
const hiddenSection = buildCardContentV3(
  perSection, { en: 'x', zh: '猫' }, { en: 'note', zh: '说明' }, true, '', ['en', 'zh'], '',
  ['zh']
);
check('independent explanation switch persists', (() => {
  const parsedSection = parseCardV3(hiddenSection.content);
  return eq(JSON.parse(hiddenSection.content)._eh, ['zh'])
    && eq(parsedSection.hiddenExplanationSections, ['zh'])
    && eq(sectionExplanationsFor(parsedSection, perSection), { en: 'note', zh: '说明' });
})());
check('legacy global explanation remains readable', (() => {
  const legacyGlobal = parseCardV3('{"_t":"lc","v":3,"en":"x","_e":"shared note"}');
  return unifiedExplanationFor(legacyGlobal) === 'shared note'
    && eq(sectionExplanationsFor(legacyGlobal, newSpeak), { en: '', newSpeak: '' });
})());
check('empty card rejected', parseCardV3('{"_t":"lc","v":3}') === null);
check('wrong version rejected', parseCardV3('{"_t":"lc","v":2,"en":"x"}') === null);

const partialFilled = buildCardContentV3(
  perSection, { en: 'hello', zh: '' }, {}, true, '', ['en', 'zh'], ''
);
const parsedPartial = parseCardV3(partialFilled.content);
check('empty section excluded from _s', eq(parsedPartial.enabledSections, ['en']));

const mapped = mapSectionKeys(
  { _t: 'lc', v: 2, personal: 'x', _e: { personal: 'note' }, _s: ['personal'], other: 'keep' },
  { personal: 'in room' }
);
check('migration renames section keys only', eq(mapped, {
  _t: 'lc', v: 2, 'in room': 'x', _e: { 'in room': 'note' }, _s: ['in room'], other: 'keep'
}));
check('migration renames hidden explanation section keys', eq(
  mapSectionKeys({ _t: 'lc', v: 3, _eh: ['personal'] }, { personal: 'in room' }),
  { _t: 'lc', v: 3, _eh: ['in room'] }
));
const migrated = migratedContent(
  '{"_t":"lc","v":2,"personal":"x","_e":{"personal":"note"}}\n#tag',
  { personal: 'in room' }
);
check('migration keeps tail tags', migrated.endsWith('\n#tag'));
check('migration bumps v to 3', JSON.parse(migrated.split('\n')[0]).v === 3);
check('migration keeps mapped value', JSON.parse(migrated.split('\n')[0])['in room'] === 'x');
const renamedSectionMigration = migratedContent(
  '{"_t":"lc","v":3,"_s":["en"],"en":"human","_e":{"en":"definition"}}',
  { en: 'hu' }
);
const renamedSectionData = JSON.parse(renamedSectionMigration);
check('renamed en content migrates to hu', renamedSectionData.hu === 'human' && !('en' in renamedSectionData));
check('renamed section metadata migrates with content', eq(
  { enabled: renamedSectionData._s, explanation: renamedSectionData._e.hu },
  { enabled: ['hu'], explanation: 'definition' }
));

if (failures) {
  console.error(`${failures} V3 contract check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('V3 contract checks passed (marker, payload, explanations, migration).');
}
