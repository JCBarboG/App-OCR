import * as XLSX from 'xlsx';
import { CATEGORIES } from '../constants/categories';

export function exportBooksToExcel(books) {
  const headers = CATEGORIES.map((c) => c.label);
  const rows = books.map((book) => CATEGORIES.map((c) => book[c.key] || ''));

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet['!cols'] = headers.map(() => ({ wch: 22 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Libros');

  XLSX.writeFile(workbook, 'libros.xlsx');
}
