import { useRef } from 'react';

export default function ImageInput({ previewUrl, onImageSelected, onClear, disabled }) {
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
          <img src={previewUrl} alt="Portada del libro" />
        ) : (
          <div className="image-input__placeholder">
            <CameraGlyph />
            <p>Sin imagen aún</p>
          </div>
        )}
      </div>

      <div className="image-input__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleCameraClick}
          disabled={disabled}
        >
          Tomar foto
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          Subir imagen
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onClear}
          disabled={disabled || !previewUrl}
        >
          Limpiar
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
