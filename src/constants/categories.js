// MARC 21 column order: A→O
export const CATEGORIES = [
  { key: 'titulo',          label: 'Título',          fieldLabel: 'Título',           colLabel: 'TÍTULO' },
  { key: 'subtitulo',       label: 'Subtítulo',       fieldLabel: 'Subtítulo',        colLabel: 'SUBTÍTULO' },
  { key: 'autor',           label: 'Autor',           fieldLabel: 'Autor',            colLabel: 'AUTOR' },
  { key: 'autorSecundario', label: 'Autor Sec.',      fieldLabel: 'Autor Secundario', colLabel: 'AUTOR SEC.' },
  { key: 'editorial',       label: 'Editorial',       fieldLabel: 'Editorial',        colLabel: 'EDITORIAL' },
  { key: 'pais',            label: 'País',            fieldLabel: 'País',             colLabel: 'PAÍS' },
  { key: 'anio',            label: 'Año',             fieldLabel: 'Año',              colLabel: 'AÑO' },
  { key: 'edicion',         label: 'Edición',         fieldLabel: 'Edición',          colLabel: 'EDICIÓN' },
  { key: 'descFisica',      label: 'Desc. Física',    fieldLabel: 'Desc. Física',     colLabel: 'DESC. FÍSICA' },
  { key: 'idioma',          label: 'Idioma',          fieldLabel: 'Idioma',           colLabel: 'IDIOMA' },
  { key: 'isbn',            label: 'ISBN',            fieldLabel: 'ISBN',             colLabel: 'ISBN' },
  { key: 'issn',            label: 'ISSN',            fieldLabel: 'ISSN',             colLabel: 'ISSN' },
  { key: 'traductor',       label: 'Traductor',       fieldLabel: 'Traductor',        colLabel: 'TRADUCTOR' },
  { key: 'revisor',         label: 'Revisor',         fieldLabel: 'Revisor',          colLabel: 'REVISOR' },
  { key: 'fecha',           label: 'Fecha',           fieldLabel: 'Fecha',            colLabel: 'FECHA' },
];

export const EMPTY_FIELDS = CATEGORIES.reduce((acc, { key }) => {
  acc[key] = '';
  return acc;
}, {});
