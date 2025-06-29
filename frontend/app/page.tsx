'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ClipCard from '@/components/ClipCard';
import VideoModal from '@/components/VideoModal';
import { Search, Loader2 } from 'lucide-react';
import { clipsApi, Clip } from '@/lib/api';

export default function HomePage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Clip[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentClips();
  }, []);

  const loadRecentClips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clipsApi.getRecent(50);
      setClips(data.clips);
    } catch (err) {
      setError('No se pudieron cargar los clips recientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    setError(null);
    try {
      const response = await clipsApi.semanticSearch(searchTerm.trim(), 1);
      setSearchResults(response.results);
    } catch (err: any) {
      setError(err.message || 'Error en la búsqueda');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    setError(null);
  };

  const handlePlay = (clip: Clip) => {
    setSelectedClip(clip);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedClip(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Buscador semántico IA */}
        <form onSubmit={handleSemanticSearch} className="mb-8 max-w-2xl mx-auto">
          <label className="block text-lg font-medium text-gray-800 mb-2 text-left">Describí el meme</label>
          <textarea
            className="w-full p-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition min-h-[80px] text-base bg-white"
            placeholder={"Describe como si le estuvieras hablando a un amigo...\nej: 'el perrito que le inyectan wifi' o 'tipo en el micro mirando ventana'"}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            disabled={searchLoading}
          />
          <button
            type="submit"
            className="btn-primary mt-4 px-8 py-2 text-lg"
            disabled={searchLoading || !searchTerm.trim()}
          >
            {searchLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Resultados de búsqueda semántica */}
        {error && (
          <div className="text-center py-12">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        )}
        
        {searchResults && (
          <>
            <div className="text-center mb-4 sm:mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Resultados de la búsqueda</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                "{searchTerm}" - {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={clearSearch}
                className="btn-primary text-sm sm:text-base"
              >
                ← Volver a clips recientes
              </button>
            </div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {searchResults.map((clip) => (
                  <div key={clip.id} className="sm:p-0 p-1">
                    <ClipCard
                      clip={clip}
                      onPlay={handlePlay}
                      smallMobile
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Intenta con otros términos de búsqueda
                </p>
                <button
                  onClick={clearSearch}
                  className="btn-primary text-sm sm:text-base"
                >
                  ← Volver a clips recientes
                </button>
              </div>
            )}
          </>
        )}

        {/* Clips recientes - siempre visibles si no hay resultados de búsqueda */}
        {!searchResults && (
          <>
            <div className="text-center mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-4">Clips recientes</h1>
              {!loading && (
                <p className="text-base sm:text-lg text-gray-600">
                  {clips.length === 0 
                    ? 'No se encontraron clips' 
                    : `${clips.length} clip${clips.length !== 1 ? 's' : ''} encontrado${clips.length !== 1 ? 's' : ''}`
                  }
                </p>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-gray-600">Cargando clips...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {clips.map((clip) => (
                  <div key={clip.id} className="sm:p-0 p-1">
                    <ClipCard
                      clip={clip}
                      onPlay={handlePlay}
                      smallMobile
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Video Modal */}
        <VideoModal
          clip={selectedClip}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      </main>
    </div>
  );
} 