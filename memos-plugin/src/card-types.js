import { CONFIG } from './config.js';

/**
 * V3 card types live in the space description marker. This module is the
 * single source of truth for reading / writing / sorting those definitions;
 * note content never stores sections, labels, colours or explanation modes.
 *
 * V2 marker {"_t":"lc","v":2} is treated as a "default type" so historical
 * spaces and cards keep rendering (see schema/v2.md).
 */

const V3_VERSION = 3;

function stripSpacePrefix(name) {
  return String(name || '').replace(/^spaces\//, '');
}

function defaultSections() {
  return CONFIG.languages.map(l => ({
    key: l.key,
    label: l.label,
    code: l.code,
    color: l.color,
    defaultHidden: l.defaultHidden === true,
    placeholder: l.placeholder || ''
  }));
}

/** Extract a language-card marker from arbitrary prose (first { -> last }). */
function extractMarker(description) {
  if (!description || !description.includes('{')) return null;
  const start = description.indexOf('{');
  const end = description.lastIndexOf('}');
  if (end <= start) return null;
  try {
    const data = JSON.parse(description.substring(start, end + 1));
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    return data._t === CONFIG.typeIdentifier ? data : null;
  } catch (e) {
    return null;
  }
}

/**
 * Short chip text is DERIVED from the label (first letters of the first two
 * words, or the first two letters), never stored — the note only carries the
 * key, and a separate code field was just a duplicate to type in.
 */
function deriveCode(label, key) {
  const words = String(label || '').trim().split(/\s+/).filter(Boolean);
  const initials = words.map(w => (w.match(/[A-Za-z0-9]/) || [])[0]).filter(Boolean);
  if (initials.length >= 2) return (initials[0] + initials[1]).toUpperCase();
  const alnum = String(label || key).match(/[A-Za-z0-9]{1,2}/);
  return String(alnum ? alnum[0] : key).slice(0, 2).toUpperCase();
}

/** Validate a V3 section definition and fill display defaults. */
function normalizeSection(section) {
  if (!section || !section.key) return null;
  const key = String(section.key).trim();
  if (!key) return null;
  const label = String(section.label || key);
  return {
    key,
    label,
    code: deriveCode(label, key),
    color: String(section.color || '#38bdf8'),
    defaultHidden: section.defaultHidden === true,
    placeholder: String(section.placeholder || '')
  };
}

/** Turn a marker + Memos space into a normalized card type. */
function normalizeType(marker, space) {
  if (!marker || marker._t !== CONFIG.typeIdentifier) return null;
  const isV3 = marker.v === V3_VERSION || marker.v === String(V3_VERSION);
  const spaceName = (space && space.name) || '';
  const spaceTitle = (space && space.title) || '';
  // Only V2 markers fall back to the built-in sections. A V3 marker that
  // declares `sections: []` means "not defined yet" and must stay empty.
  const hasSections = isV3 && Array.isArray(marker.sections);
  const rawSections = hasSections ? marker.sections : [];
  const sections = hasSections ? rawSections.map(normalizeSection).filter(Boolean) : defaultSections();
  const aliases = (isV3 && marker.sectionAliases && typeof marker.sectionAliases === 'object')
    ? marker.sectionAliases : {};
  return {
    id: String((isV3 && marker.typeId) || spaceName || 'default'),
    name: String((isV3 && marker.name) || spaceTitle || stripSpacePrefix(spaceName) || 'Language Card'),
    order: Number.isFinite(Number(marker.order)) ? Number(marker.order) : 0,
    spaceName,
    spaceTitle,
    version: isV3 ? V3_VERSION : 2,
    explanationMode: marker.explanationMode === 'global' ? 'global' : 'per-section',
    sections,
    sectionAliases: { ...aliases },
    marker
  };
}

/** A type for a space that carries no (or only a V2) marker. */
function defaultType(space) {
  const type = normalizeType({ _t: CONFIG.typeIdentifier, v: 2 }, space || { name: '', title: '' });
  type.id = 'default';
  type.name = (space && space.title) || 'Default language card';
  type.order = -1;
  return type;
}

/** Serialize a type back into a V3 space marker. */
function markerFromType(type) {
  return JSON.stringify({
    _t: CONFIG.typeIdentifier,
    v: V3_VERSION,
    typeId: type.id,
    name: type.name,
    order: type.order,
    explanationMode: type.explanationMode,
    sections: type.sections.map(s => {
      const out = { key: s.key, label: s.label, color: s.color };
      if (s.defaultHidden) out.defaultHidden = true;
      return out;
    }),
    sectionAliases: type.sectionAliases
  });
}

function sortTypes(types) {
  return [...types].sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));
}

function sectionKeys(type) {
  return type.sections.map(s => s.key);
}

function incompatibleSectionKeys(values, type) {
  const known = new Set(sectionKeys(type));
  const metadata = new Set(['_t', 'v', '_e', '_u', '_s', '_x', '_eh']);
  return Object.keys(values || {}).filter(key => (
    !metadata.has(key) && !known.has(key)
    && String(values[key] == null ? '' : values[key]).trim()
  ));
}

function typeForSpace(types, spaceName) {
  if (!spaceName) return null;
  return types.find(t => t.spaceName === spaceName) || null;
}

/** Type used for a brand new card: current URL space wins, then first by order. */
function activeTypeForNew(types, currentSpace) {
  return typeForSpace(types, currentSpace)
    || sortTypes(types)[0]
    || defaultType(null);
}

/**
 * Type for an existing memo. Mixed feeds can contain memos from several
 * spaces, so a memoName -> space cache (filled from the API when available)
 * is checked before falling back to the current URL space.
 */
function typeForMemo(types, memoName, currentSpace, memoSpaceCache) {
  const cachedSpace = memoName && memoSpaceCache ? memoSpaceCache.get(memoName) : null;
  return typeForSpace(types, cachedSpace)
    || typeForSpace(types, currentSpace)
    || activeTypeForNew(types, currentSpace);
}

/** Read a section value, honouring alias declarations (old key -> new key). */
function valueForSection(values, type, key) {
  if (values[key] !== undefined && values[key] !== null) return values[key];
  for (const [oldKey, newKey] of Object.entries(type.sectionAliases || {})) {
    if (newKey === key && values[oldKey] !== undefined) return values[oldKey];
  }
  return '';
}

/**
 * Migration helper: rename language section keys only. The language section
 * and explanation section framework is identical across types, so no other
 * structural change is needed (see schema/v3-requirements.md R4).
 */
function mapSectionKeys(data, aliasMap, keepUnknown = true) {
  const out = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (key === '_e') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const mapped = {};
        for (const [k, v] of Object.entries(value)) mapped[aliasMap[k] || k] = v;
        out._e = mapped;
      } else {
        out._e = value;
      }
      continue;
    }
    if (key === '_s' && Array.isArray(value)) {
      out._s = value.map(sectionKey => aliasMap[sectionKey] || sectionKey);
      continue;
    }
    if (key === '_eh' && Array.isArray(value)) {
      out._eh = value.map(sectionKey => aliasMap[sectionKey] || sectionKey);
      continue;
    }
    const target = aliasMap[key] || key;
    if (target !== key || keepUnknown || ['_t', 'v', '_x'].includes(key)) {
      out[target] = value;
    }
  }
  return out;
}

export {
  V3_VERSION, defaultSections, extractMarker, normalizeType, defaultType,
  markerFromType, sortTypes, sectionKeys, incompatibleSectionKeys, typeForSpace, activeTypeForNew,
  typeForMemo, valueForSection, mapSectionKeys
};
