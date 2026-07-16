import * as XLSX from 'xlsx';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';
import { getMarcSuffix } from './marcSymbols';

export function exportBooksToExcel(books, docType = 'libro', lang = 'es') {
  const cats = CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;
  const headers = cats.map((c) => c.colLabel[lang] || c.colLabel.es);

  const rows = books.map((book) =>
    cats.map((c) => {
      const val = book[c.key] || '';
      if (!val) return '';
      return val + getMarcSuffix(book, c.key, docType);
    }),
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet['!cols'] = headers.map(() => ({ wch: 24 }));

  const workbook = XLSX.utils.book_new();
  const sheetName = docType === 'libro' ? 'Libros' : docType === 'revista' ? 'Revistas' : 'Tesis';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `EBO-${sheetName.toLowerCase()}.xlsx`);
}
