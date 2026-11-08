import { CONFIG } from './config.js';

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

export { parseCardMemo, cardLangValue, cardPresentLangs };
