import { CATEGORIES } from '../constants/categories';

export default function BooksTable({
  books,
  currentFields,
  onBookCellChange,
  onCurrentFieldChange,
  onSave,
  onExport,
}) {
  return (
    <div className="books-table-section">
      <p className="books-table__counter">
        {books.length} libro{books.length === 1 ? '' : 's'} en la tabla — listos para exportar cuando termines.
      </p>

      <div className="books-table__scroll">
        <table className="books-table">
          <thead>
            <tr>
              <th className="books-table__index">#</th>
              {CATEGORIES.map((cat) => (
                <th key={cat.key}>{cat.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr key={book.id}>
                <td className="books-table__index">{index + 1}</td>
                {CATEGORIES.map((cat) => (
                  <td key={cat.key}>
                    <input
                      type="text"
                      value={book[cat.key]}
                      onChange={(e) => onBookCellChange(book.id, cat.key, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="books-table__draft-row">
              <td className="books-table__index">Nuevo</td>
              {CATEGORIES.map((cat) => (
                <td key={cat.key}>
                  <input
                    type="text"
                    value={currentFields[cat.key]}
                    onChange={(e) => onCurrentFieldChange(cat.key, e.target.value)}
                    placeholder={cat.label}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="books-table__actions">
        <button type="button" className="btn btn--ghost" onClick={onSave}>
          Guardar datos
        </button>
        <button type="button" className="btn btn--primary" onClick={onExport}>
          Exportar a Excel
        </button>
      </div>
    </div>
  );
}
