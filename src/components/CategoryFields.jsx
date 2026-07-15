import { CATEGORIES } from '../constants/categories';

export default function CategoryFields({ fields, onFieldChange, selection, onAssign, activeKey }) {
  const hasSelection = Boolean(selection.text && selection.text.trim());

  return (
    <div className="category-fields">
      <div className="selection-bar">
        <p className="selection-bar__hint">
          {hasSelection ? (
            <>
              Selección:{' '}
              <span className="selection-bar__text">"{truncate(selection.text.trim(), 80)}"</span>
            </>
          ) : (
            'Selecciona texto a la izquierda y toca una categoría para asignarlo'
          )}
        </p>
        <div className="selection-bar__chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`chip${activeKey === cat.key ? ' chip--active' : ''}`}
              disabled={!hasSelection}
              onClick={() => onAssign(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <div className="category-grid__item" key={cat.key}>
            <label htmlFor={`field-${cat.key}`}>{cat.fieldLabel}</label>
            <input
              id={`field-${cat.key}`}
              type="text"
              value={fields[cat.key]}
              onChange={(e) => onFieldChange(cat.key, e.target.value)}
              placeholder={`${cat.fieldLabel}…`}
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
