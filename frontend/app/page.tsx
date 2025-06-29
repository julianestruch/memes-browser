'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ClipCard from '@/components/ClipCard';
import VideoModal from '@/components/VideoModal';
import { Clip, clipsApi } from '@/lib/api';

export default function HomePage() {
  const [recentClips, setRecentClips] = useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Clip[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadRecentClips();
  }, []);

  const loadRecentClips = async () => {
    try {
      const response = await clipsApi.getRecent(12);
      setRecentClips(response.clips);
    } catch (error) {
      console.error('Error cargando clips recientes:', error);
      setError('No se pudieron cargar los clips recientes');
    }
  };

  const handlePlayClip = (clip: Clip) => {
    setSelectedClip(clip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClip(null);
  };

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchLoading(true);
    setError(null);
    try {
      const response = await clipsApi.semanticSearch(search.trim(), 12);
      setSearchResults(response.results);
    } catch (err: any) {
      setError(err.message || 'Error en la búsqueda');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Tus clips de video
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sube tus clips de video y visualízalos fácilmente en un solo lugar.
          </p>
        </div>
        {/* Buscador semántico */}
        <form onSubmit={handleSemanticSearch} className="mb-10 max-w-2xl mx-auto">
          <label className="block text-lg font-medium text-gray-800 mb-2 text-left">Describí el meme</label>
          <textarea
            className="w-full p-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition min-h-[80px] text-base bg-white"
            placeholder={"Describe como si le estuvieras hablando a un amigo...\nej: 'el perrito que le inyectan wifi' o 'tipo en el micro mirando ventana'"}
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={searchLoading}
          />
          <button
            type="submit"
            className="btn-primary mt-4 px-8 py-2 text-lg"
            disabled={searchLoading || !search.trim()}
          >
            {searchLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        {error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        ) : searchResults ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Resultados de la búsqueda
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <ClipCard
                  key={searchResults[0].id}
                  clip={searchResults[0]}
                  onPlay={handlePlayClip}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron resultados para tu búsqueda
                </h3>
                <p className="text-gray-600 mb-6">
                  Probá describiendo el meme de otra forma o subí un nuevo clip
                </p>
              </div>
            )}
          </div>
        ) : recentClips.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Clips recientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentClips.map((clip) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  onPlay={handlePlayClip}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay clips disponibles
            </h3>
            <p className="text-gray-600 mb-6">
              Sube tu primer clip para comenzar a llenar tu galería
            </p>
            <a
              href="/upload"
              className="btn-primary inline-flex items-center"
            >
              Subir primer clip
            </a>
          </div>
        )}
      </main>
      <VideoModal
        clip={selectedClip}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
} 