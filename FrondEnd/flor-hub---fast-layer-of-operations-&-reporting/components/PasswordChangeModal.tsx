import React, { useState } from 'react';
import { api } from '../services/api';

interface PasswordChangeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordNuevaConfirmacion: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState({
    actual: false,
    nueva: false,
    confirmacion: false
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const togglePasswordVisibility = (field: 'actual' | 'nueva' | 'confirmacion') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    // Validación de longitud mínima
    if (formData.passwordNueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    // Validación de mayúscula
    if (!/[A-Z]/.test(formData.passwordNueva)) {
      setError('Debe contener al menos una letra mayúscula (A-Z)');
      return false;
    }

    // Validación de minúscula
    if (!/[a-z]/.test(formData.passwordNueva)) {
      setError('Debe contener al menos una letra minúscula (a-z)');
      return false;
    }

    // Validación de número
    if (!/\d/.test(formData.passwordNueva)) {
      setError('Debe contener al menos un número (0-9)');
      return false;
    }

    // Validación de carácter especial
    if (!/[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(formData.passwordNueva)) {
      setError('Debe contener al menos un carácter especial');
      return false;
    }

    // Validación de coincidencia
    if (formData.passwordNueva !== formData.passwordNuevaConfirmacion) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    // Validación de que sea diferente a la actual
    if (formData.passwordNueva === formData.passwordActual) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Obtener el ID del usuario actual del localStorage o del contexto
      // Por ahora, lo obtenemos de la respuesta del backend anterior
      const response = await api.patch('/usuarios/me/password', {
        passwordActual: formData.passwordActual,
        passwordNueva: formData.passwordNueva,
        passwordNuevaConfirmacion: formData.passwordNuevaConfirmacion
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Error al actualizar contraseña');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        setError('La contraseña actual es incorrecta');
      } else if (err.message && err.message.includes('403')) {
        setError('No tienes permisos para realizar esta acción');
      } else if (err.message && err.message.includes('404')) {
        setError('Usuario no encontrado');
      } else {
        setError('Error de conexión. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-md w-full mx-auto border dark:border-white/5">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Actualizar Contraseña</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5 bg-white dark:bg-slate-950/20">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/40 rounded-xl">
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            </div>
          )}

          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPassword.actual ? 'text' : 'password'}
                value={formData.passwordActual}
                onChange={(e) => handleInputChange('passwordActual', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('actual')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword.actual ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 0 9.97 9.97 0 00-4.241 0m-6.429 1.5a9.97 9.97 0 01-4.241 0"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword.nueva ? 'text' : 'password'}
                value={formData.passwordNueva}
                onChange={(e) => handleInputChange('passwordNueva', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Crea una nueva contraseña"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('nueva')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword.nueva ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 0 9.97 9.97 0 00-4.241 0m-6.429 1.5a9.97 9.97 0 01-4.241 0"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword.confirmacion ? 'text' : 'password'}
                value={formData.passwordNuevaConfirmacion}
                onChange={(e) => handleInputChange('passwordNuevaConfirmacion', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Confirma tu nueva contraseña"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmacion')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword.confirmacion ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 0 9.97 9.97 0 00-4.241 0m-6.429 1.5a9.97 9.97 0 01-4.241 0"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Requisitos de contraseña */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-white/5">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-widest">Requisitos:</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.passwordNueva.length >= 8 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                  {formData.passwordNueva.length >= 8 ? '✓' : '○'}
                </span>
                <span>Al menos 8 caracteres</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(formData.passwordNueva) ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                  {/[A-Z]/.test(formData.passwordNueva) ? '✓' : '○'}
                </span>
                <span>Una letra mayúscula (A-Z)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/[a-z]/.test(formData.passwordNueva) ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                  {/[a-z]/.test(formData.passwordNueva) ? '✓' : '○'}
                </span>
                <span>Una letra minúscula (a-z)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/\d/.test(formData.passwordNueva) ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                  {/\d/.test(formData.passwordNueva) ? '✓' : '○'}
                </span>
                <span>Un número (0-9)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(formData.passwordNueva) ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                  {/[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(formData.passwordNueva) ? '✓' : '○'}
                </span>
                <span>Un carácter especial</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.passwordNueva === formData.passwordNuevaConfirmacion && formData.passwordNueva.length > 0 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                  {formData.passwordNueva === formData.passwordNuevaConfirmacion && formData.passwordNueva.length > 0 ? '✓' : '○'}
                </span>
                <span>Las contraseñas coinciden</span>
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold uppercase tracking-widest text-[10px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Actualizando...</span>
                </div>
              ) : (
                'Actualizar Contraseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};