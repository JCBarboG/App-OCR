import { CATEGORIES_BY_TYPE } from '../constants/docTypes';

export function getMarcSuffix(fields, currentKey, docType = 'libro') {
  const value = fields[currentKey];
  if (!value || !value.trim()) return '';

  const cats = CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;
  const keys = cats.map((c) => c.key);

  const currentIdx = keys.indexOf(currentKey);
  if (currentIdx === -1) return '';

  const hasContentAfter = keys.slice(currentIdx + 1).some((k) => fields[k] && fields[k].trim());
  if (!hasContentAfter) return '';

  if (docType === 'libro') {
    if (currentKey === 'titulo') {
      if (fields['subtitulo'] && fields['subtitulo'].trim()) return ' :';
      if (fields['autor'] && fields['autor'].trim()) return ' /';
      return ' ;';
    }
    if (currentKey === 'subtitulo') {
      if (fields['autor'] && fields['autor'].trim()) return ' /';
      return ' ;';
    }
  }

  return ' ;';
}
