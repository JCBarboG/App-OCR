export const CATEGORIES = [
  { key: 'titulo', label: 'Título' },
  { key: 'autor', label: 'Autor' },
  { key: 'editorial', label: 'Editorial' },
  { key: 'anio', label: 'Año' },
  { key: 'isbn', label: 'ISBN' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'traductor', label: 'Traductor' },
  { key: 'revisor', label: 'Revisor' },
];

export const EMPTY_FIELDS = CATEGORIES.reduce((acc, { key }) => {
  acc[key] = '';
  return acc;
}, {});
