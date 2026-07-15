import * as XLSX from 'xlsx';
import { CATEGORIES } from '../constants/categories';
import { getMarcSuffix } from './marcSymbols';

export function exportBooksToExcel(books) {
  const headers = CATEGORIES.map((c) => c.colLabel);

  const rows = books.map((book) =>
    CATEGORIES.map((c) => {
      const val = book[c.key] || '';
      if (!val) return '';
      return val + getMarcSuffix(book, c.key);
    }),
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet['!cols'] = headers.map(() => ({ wch: 24 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Libros');

  XLSX.writeFile(workbook, 'EBO-libros.xlsx');
}
