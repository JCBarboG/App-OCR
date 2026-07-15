import { CATEGORIES } from '../constants/categories';

const KEYS = CATEGORIES.map((c) => c.key);

// Returns the ISBD/MARC 21 punctuation suffix for a field value in context.
// Rules:
//   TÍTULO   → " :" if SUBTÍTULO has content; " /" if AUTOR has content; else " ;"
//   SUBTÍTULO → " /" if AUTOR has content; else " ;"
//   All others → " ;" if any later field has content
//   Last field with content → no suffix
//   Empty field → no suffix
export function getMarcSuffix(fields, currentKey) {
  const value = fields[currentKey];
  if (!value || !value.trim()) return '';

  const currentIdx = KEYS.indexOf(currentKey);
  const hasContentAfter = KEYS.slice(currentIdx + 1).some(
    (k) => fields[k] && fields[k].trim(),
  );

  if (!hasContentAfter) return '';

  if (currentKey === 'titulo') {
    if (fields['subtitulo'] && fields['subtitulo'].trim()) return ' :';
    if (fields['autor'] && fields['autor'].trim()) return ' /';
    return ' ;';
  }

  if (currentKey === 'subtitulo') {
    if (fields['autor'] && fields['autor'].trim()) return ' /';
    return ' ;';
  }

  return ' ;';
}
