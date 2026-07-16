import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';

export default function CategoryFields({ fields, onFieldChange, selection, onAssign, activeKey }) {
  const { lang, docType } = useApp();
  const t = useT(lang);
  const cats = CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;
  const hasSelection = Boolean(selection.text && selection.text.trim());

  return (
    <div className="category-fields">
      <div className="selection-bar">
        <p className="selection-bar__hint">
          {hasSelection ? (
            <>
              {t.step02.selectionPrefix}
              <span className="selection-bar__text">"{truncate(selection.text.trim(), 80)}"</span>
            </>
          ) : (
            t.step02.hint
          )}
        </p>
        <div className="selection-bar__chips">
          {cats.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`chip${activeKey === cat.key ? ' chip--active' : ''}`}
              disabled={!hasSelection}
              onClick={() => onAssign(cat.key)}
            >
              {cat.label[lang] || cat.label.es}
            </button>
          ))}
        </div>
      </div>

      <div className="category-grid">
        {cats.map((cat) => (
          <div className="category-grid__item" key={cat.key}>
            <label htmlFor={`field-${cat.key}`}>{cat.fieldLabel[lang] || cat.fieldLabel.es}</label>
            <input
              id={`field-${cat.key}`}
              type="text"
              value={fields[cat.key] || ''}
              onChange={(e) => onFieldChange(cat.key, e.target.value)}
              placeholder={`${cat.fieldLabel[lang] || cat.fieldLabel.es}…`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
