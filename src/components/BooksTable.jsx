import { CATEGORIES } from '../constants/categories';
import { getMarcSuffix } from '../utils/marcSymbols';

const COL_LETTERS = 'ABCDEFGHIJKLMNO'.split('');

export default function BooksTable({ books, onSave, onExport }) {
  return (
    <div className="books-table-section">
      <div className="excel-wrap">
        <table className="excel-table">
          <thead>
            <tr className="col-letters">
              <th />
              {CATEGORIES.map((_, i) => (
                <th key={i}>{COL_LETTERS[i]}</th>
              ))}
            </tr>
            <tr className="field-names">
              <th>1</th>
              {CATEGORIES.map((cat) => (
                <th key={cat.key}>{cat.colLabel}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr key={book.id}>
                <td>{index + 2}</td>
                {CATEGORIES.map((cat) => {
                  const val = book[cat.key] || '';
                  const suffix = val ? getMarcSuffix(book, cat.key) : '';
                  return (
                    <td key={cat.key}>
                      {val}
                      {suffix && <span className="marc-sym">{suffix}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="empty-cell">{books.length + 2}</td>
              {CATEGORIES.map((cat) => (
                <td key={cat.key} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn--outline" onClick={onSave}>
          Guardar datos
        </button>
        <button type="button" className="btn btn--primary" onClick={onExport}>
          Exportar a Excel
        </button>
      </div>
    </div>
  );
}
