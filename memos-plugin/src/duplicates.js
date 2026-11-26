function normalizeDuplicateText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function characterTrigrams(value) {
  const padded = `  ${value} `;
  const trigrams = new Set();
  for (let i = 0; i <= padded.length - 3; i++) {
    trigrams.add(padded.slice(i, i + 3));
  }
  return trigrams;
}

function characterBigrams(value) {
  const characters = Array.from(value);
  const bigrams = new Set();
  for (let i = 0; i < characters.length - 1; i++) {
    bigrams.add(characters[i] + characters[i + 1]);
  }
  return bigrams;
}

function isPossibleDuplicate(left, right) {
  const a = normalizeDuplicateText(left);
  const b = normalizeDuplicateText(right);
  if (!a || !b) return null;
  if (a === b) return 'exact';

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (shorter.length >= 12 && longer.includes(shorter)
    && shorter.length / longer.length >= 0.6) {
    return 'similar';
  }

  const aWords = a.split(' ');
  const bWords = b.split(' ');
  let wordSimilarity;
  if (Math.min(aWords.length, bWords.length) >= 4) {
    const aWordSet = new Set(aWords);
    const bWordSet = new Set(bWords);
    let sharedWords = 0;
    aWordSet.forEach(word => {
      if (bWordSet.has(word)) sharedWords++;
    });
    wordSimilarity = sharedWords / (aWordSet.size + bWordSet.size - sharedWords);
  } else {
    const aCompact = a.replace(/\s+/g, '');
    const bCompact = b.replace(/\s+/g, '');
    const aBigrams = characterBigrams(aCompact);
    const bBigrams = characterBigrams(bCompact);
    let sharedBigrams = 0;
    aBigrams.forEach(bigram => {
      if (bBigrams.has(bigram)) sharedBigrams++;
    });
    wordSimilarity = sharedBigrams / (aBigrams.size + bBigrams.size - sharedBigrams);
  }

  const hasCjk = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/u.test(a + b);
  const minSentenceLength = hasCjk ? 14 : 20;
  if (Math.min(Array.from(a).length, Array.from(b).length) < minSentenceLength
    || Math.min(a.length, b.length) / Math.max(a.length, b.length) < 0.7) {
    return null;
  }
  const aTrigrams = characterTrigrams(a);
  const bTrigrams = characterTrigrams(b);
  let sharedTrigrams = 0;
  aTrigrams.forEach(trigram => {
    if (bTrigrams.has(trigram)) sharedTrigrams++;
  });
  const trigramSimilarity = (2 * sharedTrigrams) / (aTrigrams.size + bTrigrams.size);
  return wordSimilarity >= 0.55 && trigramSimilarity >= 0.72 ? 'similar' : null;
}

function linesForSections(sections) {
  return Object.entries(sections || {}).flatMap(([section, value]) => (
    String(value || '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => ({ section, line }))
  ));
}

function mergeSectionValues(primary, secondary) {
  const primaryText = String(primary || '').trimEnd();
  const seen = new Set(
    primaryText.split(/\r?\n/)
      .map(line => normalizeDuplicateText(line))
      .filter(Boolean)
  );
  const additions = [];
  String(secondary || '').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    const normalized = normalizeDuplicateText(trimmed);
    if (!trimmed || !normalized || seen.has(normalized)) return;
    seen.add(normalized);
    additions.push(trimmed);
  });
  return [primaryText, ...additions].filter(Boolean).join('\n');
}

function matchesForSections(sections, card) {
  const matches = [];
  const cardLines = linesForSections(card.sections);
  linesForSections(sections).forEach(candidate => {
    cardLines.forEach(existing => {
      if (candidate.section !== existing.section) return;
      const confidence = isPossibleDuplicate(candidate.line, existing.line);
      if (!confidence) return;
      matches.push({
        section: candidate.section,
        candidateLine: candidate.line,
        existingLine: existing.line,
        confidence,
        memoName: card.memoName || ''
      });
    });
  });
  return matches;
}

function findDuplicateMatches(sections, cards, excludeMemoName = '') {
  return (cards || []).flatMap(card => (
    card.memoName && card.memoName === excludeMemoName ? [] : matchesForSections(sections, card)
  ));
}

function findCardDuplicatePairs(cards) {
  const list = cards || [];
  const pairs = [];
  for (let leftIndex = 0; leftIndex < list.length; leftIndex++) {
    for (let rightIndex = leftIndex + 1; rightIndex < list.length; rightIndex++) {
      const left = list[leftIndex];
      const right = list[rightIndex];
      if (left.memoName && left.memoName === right.memoName) continue;
      const matches = matchesForSections(left.sections, right);
      if (matches.length) pairs.push({ left, right, matches });
    }
  }
  return pairs;
}

export {
  normalizeDuplicateText, isPossibleDuplicate, mergeSectionValues,
  findDuplicateMatches, findCardDuplicatePairs
};
