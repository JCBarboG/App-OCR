export default function TextEditor({ value, onChange, onSelectionChange }) {
  const handleSelect = (e) => {
    const { selectionStart, selectionEnd, value: text } = e.target;
    onSelectionChange({
      start: selectionStart,
      end: selectionEnd,
      text: text.slice(selectionStart, selectionEnd),
    });
  };

  return (
    <div className="text-editor">
      <label className="text-editor__label" htmlFor="raw-text">
        Texto reconocido (corrígelo y luego selecciona fragmentos para asignarlos a una categoría)
      </label>
      <textarea
        id="raw-text"
        className="text-editor__area"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        placeholder="El texto extraído de la imagen aparecerá aquí…"
        rows={10}
        spellCheck={false}
      />
    </div>
  );
}
