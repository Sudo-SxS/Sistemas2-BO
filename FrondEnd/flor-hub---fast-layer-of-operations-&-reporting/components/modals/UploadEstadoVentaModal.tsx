import React, { useState, useRef, useCallback } from 'react';

interface UploadEstadoVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export const UploadEstadoVentaModal: React.FC<UploadEstadoVentaModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('El archivo debe ser CSV o Excel (.xlsx, .xls)');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo no debe superar los 10MB');
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch (err) {
      setError('Error al procesar el archivo. Intente nuevamente.');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-[5vh]">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-[600px] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-[3vh] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-[3vh] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[2vh]">
              <div className="w-[7vh] h-[7vh] rounded-[2vh] bg-white/10 flex items-center justify-center backdrop-blur-md">
                <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-[clamp(1rem,2vh,2.5rem)]">Actualizar Estado Ventas</h3>
                <p className="font-bold text-indigo-200 uppercase text-[clamp(0.7rem,1.2vh,1.5rem)]">Carga masiva por archivo</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="w-[6vh] h-[6vh] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              disabled={isUploading}
            >
              <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-[3vh] space-y-[2.5vh]">
          {/* Info de columnas */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-[2vh] p-[2.5vh] border border-indigo-100 dark:border-indigo-800">
            <p className="font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-widest mb-[1.5vh] text-[clamp(0.7rem,1.2vh,1.5rem)]">
              Columnas requeridas:
            </p>
            <div className="grid grid-cols-3 gap-[1.5vh]">
              {['SDS', 'DESCRIPCION ESTADO', 'DESCRIPCION RECHAZOS'].map((col) => (
                <div key={col} className="bg-white dark:bg-slate-800 rounded-[1.5vh] p-[1.5vh] text-center border border-indigo-200 dark:border-indigo-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[clamp(0.6rem,1vh,1.3rem)]">{col}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dropzone */}
          <div
            className={`relative border-2 border-dashed rounded-[2.5vh] p-[4vh] text-center transition-all ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600'
            } ${selectedFile ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleChange}
              disabled={isUploading}
            />
            
            {selectedFile ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-[8vh] h-[8vh] rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-[2vh]">
                  <svg className="w-[4vh] h-[4vh] text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.9rem,1.5vh,2rem)]">{selectedFile.name}</p>
                <p className="font-bold text-slate-500 dark:text-slate-400 mt-[1vh] text-[clamp(0.7rem,1.1vh,1.4rem)]">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <>
                <div className="w-[10vh] h-[10vh] rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-[2vh]">
                  <svg className="w-[5vh] h-[5vh] text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                </div>
                <p className="font-black text-slate-700 dark:text-slate-300 uppercase text-[clamp(0.9rem,1.5vh,2rem)]">
                  Arrastra el archivo aquí
                </p>
                <p className="font-bold text-slate-500 dark:text-slate-400 mt-[1vh] text-[clamp(0.7rem,1.1vh,1.4rem)]">
                  o haz clic para seleccionar
                </p>
                <p className="font-bold text-slate-400 dark:text-slate-500 mt-[1.5vh] text-[clamp(0.6rem,1vh,1.3rem)]">
                  CSV, XLSX o XLS (máx. 10MB)
                </p>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[2vh] p-[2vh] flex items-center gap-[2vh] animate-in slide-in-from-top-2">
              <svg className="w-[3vh] h-[3vh] text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p className="font-bold text-rose-700 dark:text-rose-400 text-[clamp(0.7rem,1.1vh,1.4rem)]">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-[2vh]">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 py-[2vh] rounded-[2vh] font-black uppercase tracking-widest border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 text-[clamp(0.8rem,1.3vh,1.7rem)]"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 py-[2vh] rounded-[2vh] font-black uppercase tracking-widest bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:shadow-none text-[clamp(0.8rem,1.3vh,1.7rem)] flex items-center justify-center gap-[1.5vh]"
            >
              {isUploading ? (
                <>
                  <div className="w-[2vh] h-[2vh] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                'Procesar Archivo'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};