import { useEffect, useRef, useState } from 'react';
import ImageInput from './components/ImageInput';
import OcrProgress from './components/OcrProgress';
import TextEditor from './components/TextEditor';
import CategoryFields from './components/CategoryFields';
import BooksTable from './components/BooksTable';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { useOcrWorker } from './hooks/useOcrWorker';
import { useToast } from './hooks/useToast';
import { EMPTY_FIELDS } from './constants/categories';
import { exportBooksToExcel } from './utils/exportExcel';
import { rotateImageBlob } from './utils/rotateImage';
import './App.css';

const MAX_IMAGES = 3;

function checkImagePortrait(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalHeight >= img.naturalWidth);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };
    img.src = url;
  });
}

export default function App() {
  // images: [{ file: Blob, previewUrl: string }]
  const [images, setImages] = useState([]);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [orientationWarning, setOrientationWarning] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [currentFields, setCurrentFields] = useState(EMPTY_FIELDS);
  const [books, setBooks] = useState([]);
  const [selection, setSelection] = useState({ start: 0, end: 0, text: '' });
  const [activeChip, setActiveChip] = useState(null);

  const activeChipTimerRef = useRef(null);
  const imagesRef = useRef([]);

  const { recognize, progress, statusLabel, isProcessing, error: ocrError } = useOcrWorker();
  const { toastMessage, showToast } = useToast();

  // Keep imagesRef in sync for cleanup
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => () => {
    imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    if (activeChipTimerRef.current) clearTimeout(activeChipTimerRef.current);
  }, []);

  const resetWorkspace = () => {
    setOcrText('');
    setCurrentFields(EMPTY_FIELDS);
    setSelection({ start: 0, end: 0, text: '' });
  };

  const handleImageAdded = (file) => {
    if (images.length >= MAX_IMAGES) return;
    setOrientationWarning('');
    const url = URL.createObjectURL(file);
    setImages((prev) => {
      const next = [...prev, { file, previewUrl: url }];
      setCurrentImageIdx(next.length - 1);
      return next;
    });
    resetWorkspace();
  };

  const handleNavigate = (idx) => {
    setCurrentImageIdx(Math.max(0, Math.min(idx, images.length - 1)));
  };

  const handleRotate = async () => {
    const current = images[currentImageIdx];
    if (!current) return;
    setOrientationWarning('');
    try {
      const rotatedBlob = await rotateImageBlob(current.file, 90);
      const oldUrl = current.previewUrl;
      const newUrl = URL.createObjectURL(rotatedBlob);
      URL.revokeObjectURL(oldUrl);
      setImages((prev) =>
        prev.map((img, i) =>
          i === currentImageIdx ? { file: rotatedBlob, previewUrl: newUrl } : img,
        ),
      );
    } catch {
      showToast('No se pudo rotar la imagen.');
    }
  };

  const handleClearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setCurrentImageIdx(0);
    setOrientationWarning('');
    resetWorkspace();
  };

  const handleExtract = async () => {
    if (images.length === 0 || isProcessing) return;

    // Check portrait orientation for all images (height >= width)
    const portraits = await Promise.all(images.map((img) => checkImagePortrait(img.file)));
    const nonPortraitIdx = portraits.findIndex((p) => !p);
    if (nonPortraitIdx !== -1) {
      const label =
        images.length === 1 ? 'La imagen' : `La imagen ${nonPortraitIdx + 1}`;
      setOrientationWarning(
        `${label} está apaisada. Rótala a orientación vertical para continuar.`,
      );
      setCurrentImageIdx(nonPortraitIdx);
      return;
    }

    setOrientationWarning('');
    try {
      const texts = [];
      for (const img of images) {
        const text = await recognize(img.file);
        texts.push(text);
      }
      setOcrText(texts.join('\n\n---\n\n'));
    } catch {
      // error shown via ocrError
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
    if (!window.confirm('¿Eliminar todos los libros de la tabla?')) return;
    setBooks([]);
  };

  return (
    <>
      <div className="app">
        <header className="app__header">
          <div className="header-banner">
            <h1>EBO</h1>
            <p className="header-sub">Extracción Bibliográfica y Organizacional</p>
          </div>
        </header>

        <main className="app__main">
          {/* Step 01 */}
          <section className="card">
            <div className="step-head">
              <span className="step-num">01</span>
              <h2>Imágenes del libro</h2>
            </div>
            <div className="divider" />
            <ImageInput
              images={images}
              currentIndex={currentImageIdx}
              onImageAdded={handleImageAdded}
              onNavigate={handleNavigate}
              onRotate={handleRotate}
              onClear={handleClearAll}
              onExtract={handleExtract}
              isBusy={isProcessing}
              orientationWarning={orientationWarning}
            />
            {isProcessing && <OcrProgress statusLabel={statusLabel} progress={progress} />}
            {ocrError && <p className="error-text">{ocrError}</p>}
          </section>

          {/* Step 02 */}
          <section className="card">
            <div className="step-head">
              <span className="step-num">02</span>
              <h2>Texto y asignación</h2>
            </div>
            <div className="divider" />
            <div className="step-grid">
              <TextEditor
                value={ocrText}
                onChange={setOcrText}
                onSelectionChange={setSelection}
              />
              <CategoryFields
                fields={currentFields}
                onFieldChange={handleCurrentFieldChange}
                selection={selection}
                onAssign={handleAssign}
                activeKey={activeChip}
              />
            </div>
          </section>

          {/* Step 03 */}
          <section className="card">
            <div className="step-head">
              <span className="step-num">03</span>
              <h2>Vista previa</h2>
            </div>
            <div className="divider" />
            <div className="status-row">
              <p className="status-count">
                {books.length} libro{books.length === 1 ? '' : 's'} en la tabla
                {books.length === 1 ? ' — listo' : ' — listos'} para exportar cuando termines.
              </p>
              <button
                type="button"
                className="icon-btn"
                aria-label="Vaciar tabla"
                onClick={handleClearBooks}
              >
                <TrashGlyph />
              </button>
            </div>
            <BooksTable
              books={books}
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
