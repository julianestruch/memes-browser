'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ClipCard from '@/components/ClipCard';
import VideoModal from '@/components/VideoModal';
import { Clip, clipsApi } from '@/lib/api';
import { Database, Loader2, AlertCircle, Filter } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

export default function RepositoryPage() {
  const [allClips, setAllClips] = useState<Clip[]>([]);
  const [filteredClips, setFilteredClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const initialPersons = [
    'Azzaro', 'Duka', 'Porcel Jr', 'Sudaka', 'Gatos',
    'Mernuel', 'Moski', 'Bauletti', 'Davo', 'BenitoSDR'
  ];
  const [personFilter, setPersonFilter] = useState<string | null>(null);

  useEffect(() => {
    loadAllClips();
  }, []);

  useEffect(() => {
    let filtered = [...allClips];

    if (personFilter) {
      filtered = filtered.filter(clip => (clip.persons || []).includes(personFilter));
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    setFilteredClips(filtered);
  }, [allClips, sortBy, personFilter]);

  const loadAllClips = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clipsApi.getRecent(1000);
      setAllClips(response.clips);
    } catch (error) {
      console.error('Error cargando clips:', error);
      setError('No se pudieron cargar los clips del repositorio');
    } finally {
      setIsLoading(false);
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

  const clearFilters = () => {
    setSortBy('date');
    setPersonFilter(null);
  };

  const allPersons = Array.from(new Set([
    ...initialPersons,
    ...allClips.flatMap(c => c.persons || [])
  ]));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Repositorio de Clips</h1>
              <p className="text-gray-600">Explora todos los videos disponibles</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{allClips.length}</div>
                <div className="text-sm text-gray-600">Total de clips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  0
                </div>
                <div className="text-sm text-gray-600">Con transcripción</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredClips.length}
                </div>
                <div className="text-sm text-gray-600">Mostrando</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date">Más recientes</option>
                <option value="title">Por título</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm">Filtrar por persona:</span>
              <CreatableSelect
                isClearable
                placeholder="Todas"
                options={allPersons.map(p => ({ label: p, value: p }))}
                value={personFilter ? { label: personFilter, value: personFilter } : null}
                onChange={opt => setPersonFilter(opt ? opt.value : null)}
                classNamePrefix="react-select"
                styles={{ container: base => ({ ...base, minWidth: 180 }) }}
              />
            </div>

            {(sortBy !== 'date') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mr-3" />
            <span className="text-lg text-gray-600">Cargando repositorio...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error cargando repositorio</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredClips.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Todos los clips
              </h2>
              <span className="text-sm text-gray-600">
                {filteredClips.length} de {allClips.length} clips
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClips.map((clip) => (
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
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay clips en el repositorio
            </h3>
            <p className="text-gray-600 mb-6">
              Sube tu primer clip para comenzar a llenar el repositorio
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