import { useEffect, useRef, useState } from 'react';
import ImageInput from './components/ImageInput';
import OcrProgress from './components/OcrProgress';
import TextEditor from './components/TextEditor';
import CategoryFields from './components/CategoryFields';
import BooksTable from './components/BooksTable';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { useOcrWorker } from './hooks/useOcrWorker';
import { useOrientationDetector } from './hooks/useOrientationDetector';
import { useToast } from './hooks/useToast';
import { EMPTY_FIELDS } from './constants/categories';
import { exportBooksToExcel } from './utils/exportExcel';
import { rotateImageBlob } from './utils/rotateImage';
import './App.css';

export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // 'idle' (sin imagen) | 'checking' | 'vertical' | 'rotated' | 'unknown'
  const [orientationStatus, setOrientationStatus] = useState('idle');
  const [ocrText, setOcrText] = useState('');
  const [currentFields, setCurrentFields] = useState(EMPTY_FIELDS);
  const [books, setBooks] = useState([]);
  const [selection, setSelection] = useState({ start: 0, end: 0, text: '' });
  const [activeChip, setActiveChip] = useState(null);
  const previewUrlRef = useRef(null);
  const activeChipTimerRef = useRef(null);
  const orientationCheckIdRef = useRef(0);

  const { recognize, progress, statusLabel, isProcessing, error: ocrError } = useOcrWorker();
  const { detectOrientation } = useOrientationDetector();
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

  const runOrientationCheck = async (image) => {
    const checkId = ++orientationCheckIdRef.current;
    setOrientationStatus('checking');
    const result = await detectOrientation(image);
    if (orientationCheckIdRef.current !== checkId) return; // hay una verificación más nueva en curso
    setOrientationStatus(result);
    if (result === 'rotated') {
      showToast('La imagen está apaisada. Rótala a vertical y vuelve a intentar.');
    }
  };

  const handleImageSelected = (file) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;

    setImageFile(file);
    setPreviewUrl(url);
    resetWorkspace();
    runOrientationCheck(file);
  };

  const handleClearImage = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    orientationCheckIdRef.current += 1; // invalida cualquier verificación en curso
    setImageFile(null);
    setPreviewUrl(null);
    setOrientationStatus('idle');
    resetWorkspace();
  };

  const handleRotate = async () => {
    if (!imageFile) return;
    try {
      const rotatedBlob = await rotateImageBlob(imageFile, 90);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = URL.createObjectURL(rotatedBlob);
      previewUrlRef.current = url;
      setImageFile(rotatedBlob);
      setPreviewUrl(url);
      runOrientationCheck(rotatedBlob);
    } catch {
      showToast('No se pudo rotar la imagen.');
    }
  };

  const isCheckingOrientation = orientationStatus === 'checking';
  const canExtract = Boolean(imageFile)
    && !isProcessing
    && !isCheckingOrientation
    && (orientationStatus === 'vertical' || orientationStatus === 'unknown');

  const handleExtract = async () => {
    if (!canExtract) return;
    try {
      const text = await recognize(imageFile);
      setOcrText(text);
    } catch {
      // El error queda disponible en ocrError para mostrarse en pantalla.
    }
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
    <>
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
              onRotate={handleRotate}
              onExtract={handleExtract}
              canExtract={canExtract}
              isChecking={isCheckingOrientation}
              isBusy={isProcessing || isCheckingOrientation}
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
      <Footer />
    </>
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
