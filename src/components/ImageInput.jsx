import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';

const MAX_IMAGES = 3;

export default function ImageInput({
  images,
  currentIndex,
  onImageAdded,
  onNavigate,
  onRotate,
  onClear,
  onExtract,
  isBusy,
  orientationWarning,
}) {
  const { lang, cameraEnabled } = useApp();
  const t = useT(lang);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const canAddMore = images.length < MAX_IMAGES;
  const hasImages = images.length > 0;
  const currentImage = images[currentIndex];

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onImageAdded(file);
    e.target.value = '';
  };

  return (
    <div className="image-input">
      <div className="gallery-container">
        <div className="gallery-inner">
          <button
            type="button"
            className="nav-btn"
            aria-label="Imagen anterior"
            onClick={() => onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            ←
          </button>

          <div className="gallery-image">
            {currentImage ? (
              <>
                <img src={currentImage.previewUrl} alt={`Imagen ${currentIndex + 1}`} />
                <button
                  type="button"
                  className="rotate-btn"
                  aria-label="Rotar 90°"
                  onClick={onRotate}
                  disabled={isBusy}
                >
                  <RotateGlyph />
                </button>
              </>
            ) : (
              <div className="gallery-placeholder">
                <PlaceholderGlyph />
              </div>
            )}
          </div>

          <button
            type="button"
            className="nav-btn"
            aria-label="Imagen siguiente"
            onClick={() => onNavigate(currentIndex + 1)}
            disabled={currentIndex >= images.length - 1}
          >
            →
          </button>
        </div>

        <div className="gallery-dots">
          {[0, 1, 2].map((i) => {
            let cls = 'dot';
            if (i === currentIndex && i < images.length) cls += ' dot--active';
            else if (i < images.length) cls += ' dot--used';
            return (
              <div
                key={i}
                className={cls}
                onClick={() => i < images.length && onNavigate(i)}
              />
            );
          })}
        </div>
      </div>

      {orientationWarning && (
        <p className="orientation-warning" role="alert">
          {orientationWarning}
        </p>
      )}

      <p className="image-hint">{t.step01.hint}</p>

      <div className="btn-row">
        {cameraEnabled && (
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={!canAddMore || isBusy}
          >
            {t.step01.takePhoto}
          </button>
        )}
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={!canAddMore || isBusy}
        >
          {t.step01.upload}
        </button>
      </div>

      <div className="btn-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onExtract}
          disabled={!hasImages || isBusy}
        >
          {t.step01.extract}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onClear}
          disabled={!hasImages || isBusy}
        >
          {t.step01.clear}
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        hidden
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        hidden
      />
    </div>
  );
}

function PlaceholderGlyph() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="19" cy="17" r="4" />
      <path d="M6 38l10-12 7 8 5-6 14 10" />
      <rect x="3" y="6" width="42" height="36" rx="3" />
    </svg>
  );
}

function RotateGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 11A8 8 0 1 0 17.5 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 5v6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
