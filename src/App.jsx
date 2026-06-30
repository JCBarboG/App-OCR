import { useEffect, useRef, useState } from 'react';
import ImageInput from './components/ImageInput';
import OcrProgress from './components/OcrProgress';
import TextEditor from './components/TextEditor';
import CategoryFields from './components/CategoryFields';
import BooksTable from './components/BooksTable';
import Toast from './components/Toast';
import { useOcrWorker } from './hooks/useOcrWorker';
import { useToast } from './hooks/useToast';
import { EMPTY_FIELDS } from './constants/categories';
import { exportBooksToExcel } from './utils/exportExcel';
import './App.css';

export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [currentFields, setCurrentFields] = useState(EMPTY_FIELDS);
  const [books, setBooks] = useState([]);
  const [selection, setSelection] = useState({ start: 0, end: 0, text: '' });
  const [activeChip, setActiveChip] = useState(null);
  const previewUrlRef = useRef(null);
  const activeChipTimerRef = useRef(null);

  const { recognize, progress, statusLabel, isProcessing, error: ocrError } = useOcrWorker();
  const { toastMessage, showToast } = useToast();

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    if (activeChipTimerRef.current) clearTimeout(activeChipTimerRef.current);
  }, []);

  const resetWorkspace = () => {
    setOcrText('');
    setCurrentFields(EMPTY_FIELDS);
    setSelection({ start: 0, end: 0, text: '' });
  };

  const handleImageSelected = async (file) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;

    setImageFile(file);
    setPreviewUrl(url);
    resetWorkspace();

    try {
      const text = await recognize(file);
      setOcrText(text);
    } catch {
      // El error queda disponible en ocrError para mostrarse en pantalla.
    }
  };

  const handleClearImage = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImageFile(null);
    setPreviewUrl(null);
    resetWorkspace();
  };

  const handleAssign = (categoryKey) => {
    const fragment = selection.text.trim();
    if (!fragment) return;
    setCurrentFields((prev) => {
      const current = prev[categoryKey];
      const next = current ? `${current}; ${fragment}` : fragment;
      return { ...prev, [categoryKey]: next };
    });

    setActiveChip(categoryKey);
    if (activeChipTimerRef.current) clearTimeout(activeChipTimerRef.current);
    activeChipTimerRef.current = setTimeout(() => setActiveChip(null), 400);
  };

  const handleCurrentFieldChange = (key, value) => {
    setCurrentFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleBookCellChange = (bookId, key, value) => {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, [key]: value } : b)));
  };

  const handleSaveBook = () => {
    const hasData = Object.values(currentFields).some((v) => v.trim());
    if (!hasData) {
      showToast('No hay datos que guardar todavía.');
      return;
    }
    setBooks((prev) => [...prev, { id: crypto.randomUUID(), ...currentFields }]);
    setCurrentFields(EMPTY_FIELDS);
    showToast('Libro agregado a la tabla.');
  };

  const handleExport = () => {
    if (books.length === 0) {
      showToast('No hay libros para exportar todavía.');
      return;
    }
    showToast(`Exportando ${books.length} libro${books.length === 1 ? '' : 's'} a Excel…`);
    exportBooksToExcel(books);
  };

  const handleClearBooks = () => {
    const confirmed = window.confirm('¿Eliminar todos los libros de la tabla?');
    if (!confirmed) return;
    setBooks([]);
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>OCR Bibliográfico</h1>
        <p>Extrae datos de portadas de libros directamente desde tu navegador</p>
      </header>

      <main className="app__main">
        <section className="card">
          <h2 className="card__title">Paso 01 · Imagen del libro</h2>
          <ImageInput
            previewUrl={previewUrl}
            onImageSelected={handleImageSelected}
            onClear={handleClearImage}
            disabled={isProcessing}
          />
          {isProcessing && <OcrProgress statusLabel={statusLabel} progress={progress} />}
          {ocrError && <p className="error-text">{ocrError}</p>}
        </section>

        <section className="card">
          <h2 className="card__title">Paso 02 · Texto y asignación</h2>
          <div className="step-grid">
            <TextEditor value={ocrText} onChange={setOcrText} onSelectionChange={setSelection} />
            <CategoryFields
              fields={currentFields}
              onFieldChange={handleCurrentFieldChange}
              selection={selection}
              onAssign={handleAssign}
              activeKey={activeChip}
            />
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Paso 03 · Vista previa</h2>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              aria-label="Vaciar tabla"
              onClick={handleClearBooks}
            >
              <TrashGlyph />
            </button>
          </div>
          <BooksTable
            books={books}
            currentFields={currentFields}
            onBookCellChange={handleBookCellChange}
            onCurrentFieldChange={handleCurrentFieldChange}
            onSave={handleSaveBook}
            onExport={handleExport}
          />
        </section>
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}

function TrashGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
