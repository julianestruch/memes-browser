'use client';

import { useState } from 'react';
import { Play, Clock, FileText, Download } from 'lucide-react';
import { Clip, getThumbnailUrl, getVideoUrl } from '@/lib/api';

interface ClipCardProps {
  clip: Clip;
  onPlay?: (clip: Clip) => void;
}

export default function ClipCard({ clip, onPlay }: ClipCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePlay = () => {
    if (onPlay) {
      onPlay(clip);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className="card overflow-hidden group transform transition-all duration-200 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        {!imageError ? (
          <img
            src={getThumbnailUrl(clip.thumbnailPath)}
            alt={clip.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <Play className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlay de reproducción */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center`}
          onClick={handlePlay}
          style={{ cursor: 'pointer' }}
        >
          <div className={`w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform transition-all duration-200 ${isHovered ? 'scale-100' : 'scale-0'}`}>
            <Play className="w-8 h-8 text-gray-800 ml-1" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {clip.title}
        </h3>
        
        {clip.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {truncateText(clip.description, 100)}
          </p>
        )}

        {clip.persons && clip.persons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {clip.persons.map((p, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{p}</span>
            ))}
          </div>
        )}

        {/* Botón de descarga */}
        <div className="flex justify-center mt-2">
          <a
            href={`/api/clips/download/${clip.id}`}
            download={clip.title.replace(/[^a-zA-Z0-9]/g, '_') + '.mp4'}
            className="btn-secondary flex items-center gap-2"
            onClick={e => e.stopPropagation()}
          >
            <Download className="w-4 h-4" /> Descargar
          </a>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(clip.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 