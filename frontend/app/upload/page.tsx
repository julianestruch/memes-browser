'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Upload, FileVideo, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { clipsApi } from '@/lib/api';
import Select from 'react-select';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const initialPersons = [
    'Azzaro', 'Duka', 'Porcel Jr', 'Sudaka', 'Gatos', 'La chabona', 'Coroniti', 'El bananero', 'Bananirou', 'Toscano', 'Cristina Kirchner', 'Milei', 'Downs',
    'Mernuel', 'Moski', 'Bauletti', 'Davo', 'BenitoSDR',
    'Maslaton', 'Marra', 'Olivia Rodrigo', 'Ana de armas', 'Coscu', 'El Momo', 'Sydney Sweeney', 'Bri Marcos', 'Fantino', 'Tronco', 'Beltran Briones', 'Dua Lipa', 'Messi',
    'Emilia Mernes', 'Nicki Nicole',
    'NN'
  ];
  const [persons, setPersons] = useState<string[]>([]);
  const personOptions = initialPersons.map(p => ({ label: p, value: p }));

  const videoPreviewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidVideoFile(file)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Por favor, selecciona un archivo de video válido (MP4, AVI, MOV, MKV, WEBM, FLV)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isValidVideoFile(file)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Por favor, selecciona un archivo de video válido (MP4, AVI, MOV, MKV, WEBM, FLV)');
      }
    }
  };

  const isValidVideoFile = (file: File): boolean => {
    const validTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm', 'video/x-flv'];
    const validExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'];
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo de video');
      return;
    }
    
    if (!title.trim()) {
      setError('Por favor, ingresa un título para el clip');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setError(null);

    try {
      const personasElegidas = persons.length === 0 ? ['NN'] : persons;
      await clipsApi.upload(selectedFile, title.trim(), description.trim(), personasElegidas);
      setUploadStatus('success');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error en upload:', error);
      setError(error instanceof Error ? error.message : 'Error subiendo el clip');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Subir nuevo clip
          </h1>
          <p className="text-gray-600">
            Sube un video y obtén transcripción automática para búsquedas semánticas
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Área de subida de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo de video
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : selectedFile 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 truncate max-w-full overflow-hidden whitespace-nowrap">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    {/* Vista previa del video */}
                    <div className="flex justify-center">
                      {videoPreviewUrl && (
                        <video
                          src={videoPreviewUrl}
                          controls
                          className="max-h-64 rounded shadow"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="btn-secondary text-sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cambiar archivo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <FileVideo className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Arrastra tu video aquí o haz clic para seleccionar
                      </p>
                      <p className="text-sm text-gray-500">
                        MP4, AVI, MOV, MKV, WEBM, FLV (máx. 100MB)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar archivo
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Perro jugando en el parque"
                className="input-field"
                required
                disabled={isUploading}
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el contenido del video para mejorar las búsquedas..."
                rows={4}
                className="input-field resize-none"
                disabled={isUploading}
              />
            </div>

            {/* Selector de personas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personas (elige una o varias)
              </label>
              <Select
                isMulti
                options={personOptions}
                value={persons.map(p => ({ label: p, value: p }))}
                onChange={opts => setPersons(opts.map(o => o.value))}
                placeholder="Selecciona personas..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Estado de upload */}
            {uploadStatus === 'uploading' && (
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-500 mr-3 animate-spin" />
                <div>
                  <p className="text-blue-700 font-medium">Procesando tu video...</p>
                  <p className="text-blue-600 text-sm">
                    Esto puede tomar unos minutos. Te notificaremos cuando esté listo.
                  </p>
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <p className="text-green-700 font-medium">¡Clip subido exitosamente!</p>
                  <p className="text-green-600 text-sm">
                    Redirigiendo a la página principal...
                  </p>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="btn-secondary"
                disabled={isUploading}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={!selectedFile || !title.trim() || isUploading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir y procesar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            ¿Qué pasa después de subir?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-medium text-xs mt-0.5">
                1
              </div>
              <p>Extraemos el audio y generamos un thumbnail automáticamente</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-medium text-xs mt-0.5">
                2
              </div>
              <p>Usamos Whisper para transcribir automáticamente el audio</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-medium text-xs mt-0.5">
                3
              </div>
              <p>Generamos embeddings semánticos para búsquedas inteligentes</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 