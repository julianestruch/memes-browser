import axios from 'axios';

// Configuración dinámica de la API URL
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // En el cliente, usar la variable de entorno pública
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  // En el servidor, usar la URL del backend
  return process.env.BACKEND_URL || 'http://localhost:3001';
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // 30 segundos para subidas de archivos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipos de datos
export interface Clip {
  id: number | string;
  title: string;
  description?: string;
  filePath: string;
  thumbnailPath: string;
  createdAt: string;
  similarity?: number;
  persons?: string[];
  duration?: number;
  width?: number;
  height?: number;
  // Campos de moderación
  status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
}

export interface UploadResponse {
  message: string;
  clipId: string;
  status: string;
}

export interface RecentClipsResponse {
  clips: Clip[];
  total: number;
}

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Funciones de la API
export const clipsApi = {
  /**
   * Sube un clip de video
   */
  upload: async (file: File, title: string, description?: string, persons?: string[]): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('videoFile', file);
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    if (persons && persons.length > 0) {
      formData.append('persons', persons.join(','));
    }

    try {
      const response = await api.post('/api/clips/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        validateStatus: (status) => status === 202 || status === 200 || status === 201,
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 202) {
        return error.response.data;
      }
      throw error;
    }
  },

  /**
   * Obtiene clips recientes
   */
  getRecent: async (limit: number = 12): Promise<RecentClipsResponse> => {
    const response = await api.get('/api/clips/recent', {
      params: { limit },
    });

    return response.data;
  },

  /**
   * Búsqueda semántica de clips
   */
  semanticSearch: async (query: string, limit: number = 10): Promise<{ results: Clip[]; total: number; query: string }> => {
    const response = await api.get('/api/clips/semantic-search', {
      params: { q: query, limit },
    });
    return response.data;
  },
};

// API del Panel de Administrador
export const adminApi = {
  /**
   * Obtiene estadísticas del panel de administrador
   */
  getStats: async (): Promise<{ pending: number; approved: number; rejected: number; total: number }> => {
    const response = await api.get('/api/clips/admin/stats');
    return response.data;
  },

  /**
   * Obtiene clips pendientes de aprobación
   */
  getPendingClips: async (limit: number = 20, skip: number = 0): Promise<{ clips: Clip[]; total: number }> => {
    const response = await api.get('/api/clips/admin/pending', {
      params: { limit, skip },
    });
    return response.data;
  },

  /**
   * Aprueba un clip
   */
  approveClip: async (clipId: string, approvedBy: string = 'admin'): Promise<{ message: string; clip: any }> => {
    const response = await api.post(`/api/clips/admin/approve/${clipId}`, {
      approvedBy,
    });
    return response.data;
  },

  /**
   * Rechaza un clip
   */
  rejectClip: async (clipId: string, reason: string, rejectedBy: string = 'admin'): Promise<{ message: string; clip: any }> => {
    const response = await api.post(`/api/clips/admin/reject/${clipId}`, {
      reason,
      rejectedBy,
    });
    return response.data;
  },

  /**
   * Borra un clip permanentemente
   */
  deleteClip: async (clipId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/clips/admin/delete/${clipId}`);
    return response.data;
  },

  /**
   * Obtiene todos los clips (pendientes, aprobados y rechazados)
   */
  getAllClips: async (limit: number = 50, skip: number = 0): Promise<{ clips: Clip[]; total: number }> => {
    const response = await api.get('/api/clips/admin/all', {
      params: { limit, skip },
    });
    return response.data;
  },
};

/**
 * Obtiene la URL completa para un archivo de media
 */
export const getMediaUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }
  
  // Si es solo el nombre del archivo, construir la URL completa
  if (!path.includes('/') && !path.includes('\\')) {
    return `${getApiUrl()}/media/${path}`;
  }
  
  // Si es una ruta completa, extraer solo el nombre del archivo
  const fileName = path.split(/[\\\/]/).pop();
  return `${getApiUrl()}/media/${fileName}`;
};

/**
 * Obtiene la URL del thumbnail
 */
export const getThumbnailUrl = (thumbnailPath: string): string => {
  return getMediaUrl(thumbnailPath);
};

/**
 * Obtiene la URL del video
 */
export const getVideoUrl = (videoPath: string): string => {
  return getMediaUrl(videoPath);
};

export default api; 