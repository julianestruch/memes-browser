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
    'Jordi Wild', 'George Floyd', 'Neo pistea', 'Duki', 'Ysy', 'Llados', 'El xokas', 'Mascherano',
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
      
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Subir nuevo clip
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sube un video y obtén transcripción automática para búsquedas semánticas
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Área de subida de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo de video
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
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
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-medium text-gray-900 truncate max-w-full overflow-hidden whitespace-nowrap">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    {/* Vista previa del video */}
                    <div className="flex justify-center">
                      {videoPreviewUrl && (
                        <video
                          src={videoPreviewUrl}
                          controls
                          className="max-h-48 sm:max-h-64 rounded shadow w-full max-w-full"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Remover archivo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-center">
                      <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        Arrastra y suelta tu video aquí
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        o haz clic para seleccionar
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
                    >
                      Seleccionar archivo
                    </button>
                  </div>
                )}
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
                className="input-field text-sm sm:text-base"
                placeholder="Ingresa el título del clip"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="input-field text-sm sm:text-base resize-none"
                placeholder="Describe el contenido del clip (opcional)"
              />
            </div>

            {/* Personas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personas en el clip
              </label>
              <Select
                isMulti
                options={personOptions}
                value={persons.map(p => ({ label: p, value: p }))}
                onChange={(selected) => setPersons(selected ? selected.map(s => s.value) : [])}
                placeholder="Selecciona las personas que aparecen..."
                className="text-sm sm:text-base"
                classNamePrefix="select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    fontSize: '14px',
                    minHeight: '40px',
                    '@media (min-width: 640px)': {
                      fontSize: '16px',
                      minHeight: '44px'
                    }
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: '14px',
                    '@media (min-width: 640px)': {
                      fontSize: '16px'
                    }
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                    '@media (min-width: 640px)': {
                      fontSize: '14px'
                    }
                  })
                }}
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Si no seleccionas ninguna persona, se asignará "NN"
              </p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm sm:text-base text-red-700">{error}</span>
              </div>
            )}

            {/* Botón de envío */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isUploading}
                className={`btn-primary text-sm sm:text-base py-2 sm:py-3 px-6 sm:px-8 min-w-[120px] sm:min-w-[140px] ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Subir Clip</span>
                  </div>
                )}
              </button>
            </div>

            {/* Estado de éxito */}
            {uploadStatus === 'success' && (
              <div className="flex items-center justify-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="text-sm sm:text-base text-green-700">
                  ¡Clip subido exitosamente! Redirigiendo...
                </span>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
} 