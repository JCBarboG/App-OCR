import { useCallback, useEffect, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';

// Mensajes de estado que emite Tesseract.js durante el reconocimiento,
// traducidos para mostrar al usuario.
const STATUS_LABELS = {
  'loading tesseract core': 'Cargando motor OCR…',
  'initializing tesseract': 'Inicializando OCR…',
  'loading language traineddata': 'Cargando datos de idioma…',
  'initializing api': 'Preparando reconocimiento…',
  'recognizing text': 'Reconociendo texto…',
};

// Todos los assets de Tesseract (worker, núcleo WASM y datos de idioma) se
// sirven desde /public en el mismo origen que la app, evitando problemas de
// resolución de rutas o de CORS contra un CDN externo en producción.
//
// Importante: se construyen como URLs absolutas (con origin) y no relativas.
// El worker de Tesseract se crea a partir de un Blob (`importScripts(...)`
// dentro de un worker con location "blob:"), y en ese contexto los
// navegadores no resuelven correctamente rutas relativas a la raíz como
// "/tesseract/worker.min.js" — lanzan "The URL is invalid". Resolverlas aquí
// mismo contra `window.location.href` evita depender de la resolución
// interna de la librería frente a esa particularidad de los blob workers.
const absoluteUrl = (path) => new URL(path, window.location.href).href;
const BASE = import.meta.env.BASE_URL;

const WORKER_PATH = absoluteUrl(`${BASE}tesseract/worker.min.js`);
const CORE_PATH = absoluteUrl(`${BASE}tesseract/`);
const LANG_PATH = absoluteUrl(`${BASE}tessdata/`);

export function useOcrWorker() {
  const workerRef = useRef(null);
  const workerPromiseRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const getWorker = useCallback(() => {
    if (workerRef.current) return Promise.resolve(workerRef.current);
    if (!workerPromiseRef.current) {
      workerPromiseRef.current = createWorker(['spa', 'eng'], 1, {
        workerPath: WORKER_PATH,
        corePath: CORE_PATH,
        langPath: LANG_PATH,
        logger: (m) => {
          if (typeof m.progress === 'number') setProgress(m.progress);
          if (m.status) setStatusLabel(STATUS_LABELS[m.status] || m.status);
        },
      }).then((worker) => {
        workerRef.current = worker;
        return worker;
      });
    }
    return workerPromiseRef.current;
  }, []);

  useEffect(() => () => {
    workerRef.current?.terminate();
  }, []);

  const recognize = useCallback(async (image) => {
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setStatusLabel('Preparando…');
    try {
      const worker = await getWorker();
      const { data } = await worker.recognize(image);
      return data.text.trim();
    } catch (err) {
      const message = err?.message || 'No se pudo procesar la imagen.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [getWorker]);

  return { recognize, progress, statusLabel, isProcessing, error };
}
