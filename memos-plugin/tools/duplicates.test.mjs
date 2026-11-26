import {
  isPossibleDuplicate, mergeSectionValues, findDuplicateMatches, findCardDuplicatePairs
} from '../src/duplicates.js';

let failures = 0;
function check(name, condition) {
  if (!condition) {
    failures++;
    console.error(`FAIL ${name}`);
  }
}

check('normalizes case and punctuation', isPossibleDuplicate('Hello, World!', 'hello world') === 'exact');
check('matches a repeated line inside a section', isPossibleDuplicate('serendipity', ' Serendipity ') === 'exact');
check('detects similar sentence wording', isPossibleDuplicate(
  'The quick brown fox jumps over the lazy dog',
  'The quick brown fox jumped over the lazy dog today'
) === 'similar');
check('detects similar CJK sentences without spaces', isPossibleDuplicate(
  '春天的时候我们经常去附近的公园散步',
  '春天的时候我们经常在附近的公园散步'
) === 'similar');
check('does not fuzzily match short words', isPossibleDuplicate('cat', 'cats') === null);
check('merge preserves both cards while removing exact line duplicates', mergeSectionValues(
  'cat\nfeline', 'FELINE!\nkitten'
) === 'cat\nfeline\nkitten');

const draft = { en: 'color\ncolour', ja: '猫' };
const cards = [
  { memoName: 'memos/one', sections: { en: 'colour\nColor', ja: '犬' } },
  { memoName: 'memos/two', sections: { en: 'different', ja: 'ねこ' } }
];
const matches = findDuplicateMatches(draft, cards);
check('matches lines independently within the same section', matches.length === 2);
check('does not match across sections', matches.every(match => match.section === 'en'));
check('excludes the card being edited', findDuplicateMatches(draft, cards, 'memos/one').length === 0);

const pairs = findCardDuplicatePairs([
  { memoName: 'memos/a', sections: { en: 'Good morning' } },
  { memoName: 'memos/b', sections: { en: 'good morning!' } },
  { memoName: 'memos/c', sections: { ja: 'Good morning' } }
]);
check('finds duplicates while browsing loaded cards', pairs.length === 1);
check('preserves both detected lines for review', pairs[0] && pairs[0].matches[0].candidateLine === 'Good morning');

if (failures) process.exitCode = 1;
else console.log('Duplicate detection tests passed.');
