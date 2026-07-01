import { useRef } from 'react';

export default function ImageInput({
  previewUrl,
  onImageSelected,
  onClear,
  onRotate,
  onExtract,
  canExtract,
  orientationStatus,
  isBusy,
}) {
  const isChecking = orientationStatus === 'checking';
  const isRotated = orientationStatus === 'rotated';
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onImageSelected(file);
    e.target.value = '';
  };

  const handleCameraClick = () => {
    if (previewUrl) {
      const confirmed = window.confirm('¿Reemplazar la foto actual?');
      if (!confirmed) return;
    }
    cameraInputRef.current?.click();
  };

  return (
    <div className="image-input">
      <div className="image-input__display">
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Portada del libro" />
            <button
              type="button"
              className="image-input__rotate"
              aria-label="Rotar 90°"
              onClick={onRotate}
              disabled={isBusy}
            >
              <RotateGlyph />
            </button>
          </>
        ) : (
          <div className="image-input__placeholder">
            <CameraGlyph />
            <p>Sin imagen aún</p>
          </div>
        )}
      </div>

      <p className="image-input__hint">
        Para mejor reconocimiento, captura la portada en formato vertical. Si la
        imagen está apaisada, usa el botón de rotación (esquina inferior derecha).
      </p>

      {isChecking && (
        <p className="image-input__orientation-status" role="status" aria-live="polite">
          Revisando orientación…
        </p>
      )}

      {isRotated && (
        <p className="image-input__orientation-warning" role="alert">
          La imagen está apaisada. Rótala a vertical para poder extraer.
        </p>
      )}

      <div className="image-input__actions">
        <div className="image-input__actions-row">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleCameraClick}
            disabled={isBusy}
          >
            Tomar foto
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
          >
            Subir imagen
          </button>
        </div>
        <div className="image-input__actions-row">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onExtract}
            disabled={!canExtract}
          >
            Extraer información
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onClear}
            disabled={isBusy || !previewUrl}
          >
            Limpiar
          </button>
        </div>
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

function CameraGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M14 14.5 15.6 11h16.8l1.6 3.5H38a3 3 0 0 1 3 3V35a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V17.5a3 3 0 0 1 3-3h4Z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="24" cy="25" r="7" fill="var(--color-bg)" />
      <circle cx="24" cy="25" r="4.2" fill="currentColor" opacity="0.45" />
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
