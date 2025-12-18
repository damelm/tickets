import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tickets, configuracion } from '../services/api';
import Alert from '../components/Alert';
import { getCategoryIcon } from '../utils/helpers';

const STEPS = ['Problema', 'Categoría', 'Urgencia', 'Detalles'];

export default function CreateTicket() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    categoriaOtro: '',
    prioridad_usuario: 'Media',
    descripcion: '',
    solicitante: '',
    contacto: '',
    sede: 'Casa Central',
    sedeOtro: ''
  });
  const [catalogos, setCatalogos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCatalogos();
  }, []);

  const loadCatalogos = async () => {
    try {
      const response = await configuracion.getCatalogos();
      setCatalogos(response.data.catalogos);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };

  const handleNext = () => {
    // Validaciones por paso
    if (currentStep === 0 && !formData.titulo.trim()) {
      setError('Por favor ingresa un título para el problema');
      return;
    }

    if (currentStep === 1 && !formData.categoria) {
      setError('Por favor selecciona una categoría');
      return;
    }

    if (currentStep === 1 && formData.categoria === 'Otros / Consultas' && !formData.categoriaOtro.trim()) {
      setError('Por favor especifica la categoría');
      return;
    }

    setError('');
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones finales
    if (!formData.descripcion.trim()) {
      setError('Por favor ingresa una descripción detallada');
      return;
    }

    if (!formData.solicitante.trim()) {
      setError('Por favor ingresa tu nombre completo');
      return;
    }

    if (!formData.contacto.trim()) {
      setError('Por favor ingresa tu email de contacto');
      return;
    }

    if (formData.sede === 'Otro' && !formData.sedeOtro.trim()) {
      setError('Por favor especifica la sede');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Preparar datos
      const ticketData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        prioridad_usuario: formData.prioridad_usuario,
        categoria: formData.categoria === 'Otros / Consultas' && formData.categoriaOtro
          ? formData.categoriaOtro
          : formData.categoria,
        sede: formData.sede === 'Otro' ? formData.sedeOtro : formData.sede,
        solicitante: formData.solicitante,
        contacto: formData.contacto
      };

      const response = await tickets.create(ticketData);
      const ticket = response.data.ticket;

      setSuccess(ticket);

      // Reset form después de 5 segundos
      setTimeout(() => {
        setFormData({
          titulo: '',
          categoria: '',
          categoriaOtro: '',
          prioridad_usuario: 'Media',
          descripcion: '',
          solicitante: '',
          contacto: '',
          sede: 'Casa Central',
          sedeOtro: ''
        });
        setCurrentStep(0);
        setSuccess(null);
      }, 5000);

    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  // Si se creó exitosamente, mostrar mensaje
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Ticket Creado!</h2>
            <p className="text-slate-600 mb-6">Tu ticket ha sido registrado exitosamente</p>

            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <div className="text-sm text-slate-600 mb-1">Número de Ticket</div>
              <div className="text-3xl font-bold text-teal-700">#{success.id}</div>
              <div className="mt-4 text-sm text-slate-700">
                <div className="font-medium">{success.titulo}</div>
                <div className="text-slate-500 mt-1">Prioridad: {success.prioridad_usuario}</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📧 Recibirás actualizaciones por correo electrónico a <strong>{success.contacto}</strong>
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Nuestro equipo de soporte se pondrá en contacto contigo pronto.
              <br />
              Redirigiendo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-700 to-teal-600 rounded-xl mb-4">
            <span className="text-white font-bold text-lg">SF</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Crear Nuevo Ticket</h1>
          <p className="text-slate-600 mt-2">Sistema de Soporte Técnico - Siete Fronteras</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm
                  ${index <= currentStep ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}
                >
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:inline
                  ${index <= currentStep ? 'text-teal-700' : 'text-slate-500'}`}
                >
                  {step}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-1 mx-2
                    ${index < currentStep ? 'bg-teal-700' : 'bg-slate-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* PASO 1: Problema */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">¿Cuál es el problema?</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título del problema <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Impresora no responde, Sin acceso a correo..."
                    maxLength={100}
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.titulo.length}/100 caracteres
                  </p>
                </div>
              </div>
            )}

            {/* PASO 2: Categoría */}
            {currentStep === 1 && catalogos && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Selecciona la categoría</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogos.categorias.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, categoria: cat })}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md
                        ${formData.categoria === cat
                          ? 'border-teal-700 bg-teal-50'
                          : 'border-slate-200 hover:border-teal-300'
                        }`}
                    >
                      <div className="text-2xl mb-2">{getCategoryIcon(cat)}</div>
                      <div className="font-medium text-slate-900">{cat}</div>
                    </button>
                  ))}
                </div>

                {formData.categoria === 'Otros / Consultas' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Especifica la categoría
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Describe el tipo de problema..."
                      value={formData.categoriaOtro}
                      onChange={(e) => setFormData({ ...formData, categoriaOtro: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* PASO 3: Urgencia */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">¿Qué tan urgente es?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'Baja', label: 'Baja', desc: 'Puede esperar', color: 'slate' },
                    { value: 'Media', label: 'Media', desc: 'Normal', color: 'cyan' },
                    { value: 'Alta', label: 'Alta', desc: 'Afecta mi trabajo', color: 'yellow' },
                    { value: 'Crítica', label: 'Crítica', desc: 'Bloqueante urgente', color: 'red' }
                  ].map((prioridad) => (
                    <button
                      key={prioridad.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, prioridad_usuario: prioridad.value })}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md
                        ${formData.prioridad_usuario === prioridad.value
                          ? `border-${prioridad.color}-600 bg-${prioridad.color}-50`
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="font-semibold text-slate-900">{prioridad.label}</div>
                      <div className="text-sm text-slate-600 mt-1">{prioridad.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800">
                    ℹ️ El equipo de soporte validará la urgencia final
                  </p>
                </div>
              </div>
            )}

            {/* PASO 4: Detalles */}
            {currentStep === 3 && catalogos && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Detalles del ticket</h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción detallada <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="textarea"
                    rows={6}
                    placeholder={"• ¿Qué estabas haciendo cuando ocurrió?\n• ¿Qué mensaje de error aparece?\n• ¿Desde cuándo ocurre?"}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Juan Pérez"
                    value={formData.solicitante}
                    onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email de contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="input"
                    placeholder="tu.email@sietefronteras.com.py"
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    required
                  />
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                    <p className="text-sm text-yellow-800">
                      📧 Recibirás actualizaciones por correo electrónico
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sede <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="select"
                    value={formData.sede}
                    onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                    required
                  >
                    {catalogos.sedes.map((sede) => (
                      <option key={sede} value={sede}>{sede}</option>
                    ))}
                  </select>
                </div>

                {formData.sede === 'Otro' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Especifica la sede
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Nombre de la sede..."
                      value={formData.sedeOtro}
                      onChange={(e) => setFormData({ ...formData, sedeOtro: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between mt-8">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="btn-secondary"
                >
                  ← Anterior
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-teal-700 hover:text-teal-800 font-medium"
                >
                  ¿Eres técnico? Inicia sesión
                </button>
              )}

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Ticket'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
