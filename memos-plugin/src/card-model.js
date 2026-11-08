import { CONFIG } from './config.js';
import { V3_VERSION, valueForSection } from './card-types.js';

/** Parsing / normalization of the JSON payload stored inside a memo. */

  /**
   * Resilient JSON and Tag Parser with Identifier Validation
   */
  function parseCardMemo(rawText, currentSpace) {
    if (!rawText || !rawText.includes('{')) return null;

    const startIdx = rawText.indexOf('{');
    const endIdx = rawText.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;

    const jsonCandidate = rawText.substring(startIdx, endIdx + 1);
    const tagsCandidate = rawText.substring(endIdx + 1);

    let cardData = null;

    try {
      cardData = JSON.parse(jsonCandidate);
    } catch (e) {
      const fields = {};
      const reg = /"(_t|en|ja|jp|zh|cn|v)"\s*:\s*"([\s\S]*?)"(?=\s*[,}])/g;
      let m;
      while ((m = reg.exec(jsonCandidate)) !== null) {
        fields[m[1]] = m[2].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
      if (Object.keys(fields).length > 0) {
        cardData = fields;
      }
    }

    if (!cardData || typeof cardData !== 'object') return null;

    if (cardData._t && cardData._t !== CONFIG.typeIdentifier) return null;

    const hasLang = ['en', 'ja', 'jp', 'zh', 'cn'].some((k) => k in cardData);
    const isExplicitCard = cardData._t === CONFIG.typeIdentifier;
    const isDedicatedSpace = Boolean(
      CONFIG.dedicatedSpaceKeyword &&
      currentSpace &&
      currentSpace.toLowerCase().includes(CONFIG.dedicatedSpaceKeyword.toLowerCase())
    );
    const isLegacyCard = (cardData.v || cardData.v === 0) && hasLang;

    if (!isExplicitCard && !isDedicatedSpace && !isLegacyCard) {
      return null;
    }

    const tags = (tagsCandidate.match(/#[^\s#]+/g) || []);
    const hasValues = ['en', 'ja', 'jp', 'zh', 'cn'].some(
      (k) => cardData[k] && String(cardData[k]).trim().length > 0
    );
    if (!hasValues && tags.length === 0) {
      return null;
    }

    return { data: cardData, tags, rawText };
  }

  /**
   * Value of one language section in card data, with legacy key fallback
   * (jp -> ja, cn -> zh). Returns "" when the section is absent or empty.
   */
  function cardLangValue(data, langKey) {
    if (!data) return '';
    const legacy = langKey === 'ja' ? data['jp'] : (langKey === 'zh' ? data['cn'] : null);
    const val = data[langKey] || legacy || '';
    return String(val).trim();
  }

  /** Languages the card actually has content in, in CONFIG (UI) order */
  function cardPresentLangs(data) {
    return CONFIG.languages.filter(lang => cardLangValue(data, lang.key)).map(lang => lang.key);
  }

// --- V3: definitions live in the space, note content carries values only ---

  /** Normalize the tags input the same way for V2 and V3 payloads. */
  function normalizeTags(rawTags) {
    const raw = String(rawTags || '').trim();
    return raw
      ? raw.split(/[\s,]+/)
        .map(t => (t.startsWith('#') ? t : `#${t}`))
        .filter(t => t.length > 1)
        .join(' ')
      : '';
  }

  /**
   * V3 content: {"_t":"lc","v":3,<section keys>, "_e": explanations,
   * "_u": unified explanation, "_s": visible sections, "_x": bool}
   * followed by optional tail tags. No sections / labels / order / mode here.
   */
  function parseCardV3(rawText) {
    if (!rawText || !rawText.includes('{')) return null;
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (end <= start) return null;
    let data;
    try {
      data = JSON.parse(rawText.substring(start, end + 1));
    } catch (e) {
      return null;
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    if (data._t !== CONFIG.typeIdentifier || data.v !== V3_VERSION) return null;
    const tags = (rawText.substring(end + 1).match(/#[^\s#]+/g) || []);
    const values = {};
    for (const [key, value] of Object.entries(data)) {
      if (!['_t', 'v', '_e', '_u', '_s', '_x'].includes(key)) values[key] = value;
    }
    const hasValues = Object.values(values).some(v => v && String(v).trim().length > 0);
    if (!hasValues && tags.length === 0) return null;
    return {
      version: V3_VERSION,
      data,
      values,
      tags,
      explanations: data._e === undefined ? {} : data._e,
      unifiedExplanation: typeof data._u === 'string'
        ? data._u
        : (typeof data._e === 'string' ? data._e : ''),
      enabledSections: Array.isArray(data._s)
        ? data._s.filter(key => typeof key === 'string')
        : Object.keys(values).filter(key => values[key] && String(values[key]).trim()),
      showExplanation: data._x !== false,
      rawText
    };
  }

  /** Dispatch by version; V2 behaviour is untouched (schema/v2.md vectors). */
  function parseAnyCard(rawText, currentSpace) {
    const v3 = parseCardV3(rawText);
    if (v3) return v3;
    const legacy = parseCardMemo(rawText, currentSpace);
    if (!legacy) return null;
    return {
      version: 2,
      data: legacy.data,
      values: legacy.data,
      tags: legacy.tags,
      explanations: {},
      unifiedExplanation: '',
      enabledSections: [],
      showExplanation: false,
      rawText: legacy.rawText
    };
  }

  /** Serialize values, section explanations, visibility and the unified explanation. */
  function buildCardContentV3(
    type, values, explanations, showExplanation, tags, enabledSections, unifiedExplanation
  ) {
    const data = { _t: CONFIG.typeIdentifier, v: V3_VERSION };
    let hasAny = false;
    type.sections.forEach(section => {
      const val = String((values && values[section.key]) || '').trim();
      if (val) {
        data[section.key] = val;
        hasAny = true;
      }
    });

    const mapped = {};
    type.sections.forEach(section => {
      const text = String((explanations && typeof explanations === 'object'
        && explanations[section.key]) || '').trim();
      if (text) mapped[section.key] = text;
    });
    if (Object.keys(mapped).length) data._e = mapped;
    const unifiedText = String(
      unifiedExplanation || (typeof explanations === 'string' ? explanations : '')
    ).trim();
    if (unifiedText) data._u = unifiedText;

    const visible = type.sections
      .filter(section => (enabledSections || []).includes(section.key))
      .map(section => section.key);
    data._s = visible;
    if (showExplanation === false) data._x = false;

    const normalizedTags = normalizeTags(tags);
    const content = JSON.stringify(data) + (normalizedTags ? `\n${normalizedTags}` : '');
    return { data, content, tags: normalizedTags, hasAny };
  }

  /** Section values for a type, honouring declared aliases. */
  function valuesFor(parsed, type) {
    const out = {};
    type.sections.forEach(section => {
      out[section.key] = String(valueForSection(parsed.values || parsed.data || {}, type, section.key) || '').trim();
    });
    return out;
  }

  /** Explanation values for a type (string for global, key map otherwise). */
  function explanationsFor(parsed, type) {
    const raw = parsed.explanations || {};
    if (type.explanationMode === 'global') {
      return typeof raw === 'string' ? raw : Object.values(raw).join('\n');
    }
    const out = {};
    type.sections.forEach(section => {
      let text = (raw && typeof raw === 'object' && raw[section.key]) || '';
      for (const [oldKey, newKey] of Object.entries(type.sectionAliases || {})) {
        if (newKey === section.key && raw && typeof raw === 'object' && raw[oldKey]) {
          text = raw[oldKey];
        }
      }
      out[section.key] = String(text).trim();
    });
    return out;
  }

  /** Per-section explanations, retaining support for older global-only cards. */
  function sectionExplanationsFor(parsed, type) {
    const raw = parsed.explanations || {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return Object.fromEntries(type.sections.map(section => [section.key, '']));
    }
    return explanationsFor({ ...parsed, explanations: raw }, { ...type, explanationMode: 'per-section' });
  }

  /** Unified text includes legacy global `_e` strings as well as current `_u`. */
  function unifiedExplanationFor(parsed, type) {
    if (typeof parsed.unifiedExplanation === 'string' && parsed.unifiedExplanation) {
      return parsed.unifiedExplanation;
    }
    if (typeof parsed.explanations === 'string') return parsed.explanations;
    if (type && type.explanationMode === 'global' && parsed.explanations
      && typeof parsed.explanations === 'object') {
      return Object.values(parsed.explanations).join('\n');
    }
    return '';
  }

export {
  parseCardMemo, cardLangValue, cardPresentLangs,
  parseCardV3, parseAnyCard, buildCardContentV3, normalizeTags,
  valuesFor, explanationsFor, sectionExplanationsFor, unifiedExplanationFor
};
