'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ClipCard from '@/components/ClipCard';
import VideoModal from '@/components/VideoModal';
import { Search, Loader2 } from 'lucide-react';
import { clipsApi, Clip } from '@/lib/api';

export default function HomePage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [filteredClips, setFilteredClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadClips();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClips(clips);
    } else {
      const filtered = clips.filter(clip => 
        clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clip.persons?.some(person => 
          person.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredClips(filtered);
    }
  }, [searchTerm, clips]);

  const loadClips = async () => {
    try {
      setLoading(true);
      const data = await clipsApi.getRecent(50);
      setClips(data.clips);
      setFilteredClips(data.clips);
    } catch (error) {
      console.error('Error loading clips:', error);
    } finally {
      setLoading(false);
    }
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
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Busca y descubre clips increíbles
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Encuentra el contenido que buscas con búsquedas semánticas inteligentes
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Busca por título, descripción o personas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-gray-600">
              {filteredClips.length === 0 
                ? 'No se encontraron clips' 
                : `${filteredClips.length} clip${filteredClips.length !== 1 ? 's' : ''} encontrado${filteredClips.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Cargando clips...</p>
            </div>
          </div>
        )}

        {/* Clips Grid */}
        {!loading && filteredClips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredClips.map((clip) => (
              <ClipCard
                key={clip.id}
                clip={clip}
                onPlay={handlePlay}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredClips.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Intenta con otros términos de búsqueda
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="btn-primary text-sm sm:text-base"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* No Clips State */}
        {!loading && clips.length === 0 && !searchTerm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              No hay clips disponibles
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Sé el primero en subir un clip
            </p>
            <a
              href="/upload"
              className="btn-primary text-sm sm:text-base"
            >
              Subir primer clip
            </a>
          </div>
        )}
      </main>

      {/* Video Modal */}
      <VideoModal
        clip={selectedClip}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
} 