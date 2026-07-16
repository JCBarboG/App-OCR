import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';

export default function ConfigPanel({ open, onClose }) {
  const { lang, setLang, darkMode, setDarkMode, cameraEnabled, setCameraEnabled } = useApp();
  const t = useT(lang);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div className={`drawer-overlay${open ? ' drawer-overlay--open' : ''}`} onClick={onClose} />
      <aside className={`config-panel${open ? ' config-panel--open' : ''}`} aria-modal="true" role="dialog">
        <div className="config-panel__header">
          <span className="config-panel__title">{t.config.title}</span>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="config-panel__body">
          {/* Language */}
          <section className="config-section">
            <h3 className="config-section__title">{t.config.language}</h3>
            <div className="config-lang-row">
              <button
                type="button"
                className={`config-lang-btn${lang === 'es' ? ' config-lang-btn--active' : ''}`}
                onClick={() => setLang('es')}
              >
                🇨🇷 Español
              </button>
              <button
                type="button"
                className={`config-lang-btn${lang === 'en' ? ' config-lang-btn--active' : ''}`}
                onClick={() => setLang('en')}
              >
                🇺🇸 English
              </button>
            </div>
          </section>

          {/* Appearance */}
          <section className="config-section">
            <h3 className="config-section__title">{t.config.appearance}</h3>
            <label className="config-toggle-row">
              <span className="config-toggle-label">{t.config.darkMode}</span>
              <Toggle checked={darkMode} onChange={setDarkMode} />
            </label>
          </section>

          {/* Permissions */}
          <section className="config-section">
            <h3 className="config-section__title">{t.config.permissions}</h3>
            <label className="config-toggle-row">
              <span className="config-toggle-label">{t.config.cameraAccess}</span>
              <Toggle checked={cameraEnabled} onChange={setCameraEnabled} />
            </label>
          </section>

          {/* Info */}
          <section className="config-section">
            <h3 className="config-section__title">{t.config.info}</h3>
            <div className="config-info-row">
              <span className="config-info-label">{t.config.version}</span>
              <span className="config-info-value">v3.0.0</span>
            </div>
            <div className="config-info-row">
              <span className="config-info-label">{t.config.env}</span>
              <span className="config-info-value config-info-value--env">Free</span>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`toggle${checked ? ' toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__thumb" />
    </button>
  );
}
