import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';
import { getMarcSuffix } from '../utils/marcSymbols';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BooksTable({ books, onSave, onExport }) {
  const { lang, docType } = useApp();
  const t = useT(lang);
  const cats = CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;

  return (
    <div className="books-table-section">
      <div className="excel-wrap">
        <table className="excel-table">
          <thead>
            <tr className="col-letters">
              <th />
              {cats.map((_, i) => <th key={i}>{LETTERS[i]}</th>)}
            </tr>
            <tr className="field-names">
              <th>1</th>
              {cats.map((cat) => (
                <th key={cat.key}>{cat.colLabel[lang] || cat.colLabel.es}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr key={book.id}>
                <td>{index + 2}</td>
                {cats.map((cat) => {
                  const val = book[cat.key] || '';
                  const suffix = val ? getMarcSuffix(book, cat.key, docType) : '';
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
              {cats.map((cat) => <td key={cat.key} />)}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn--outline" onClick={onSave}>
          {t.step03.save}
        </button>
        <button type="button" className="btn btn--primary" onClick={onExport}>
          {t.step03.export}
        </button>
      </div>
    </div>
  );
}
