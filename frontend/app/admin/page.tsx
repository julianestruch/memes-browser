'use client';

import { useState, useEffect } from 'react';
import { adminApi, Clip, getThumbnailUrl } from '@/lib/api';
import { CheckCircle, XCircle, Clock, BarChart3, Users, Eye, AlertCircle, Trash2 } from 'lucide-react';

interface AdminStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

interface PendingClip extends Clip {
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingClips, setPendingClips] = useState<PendingClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClip, setSelectedClip] = useState<PendingClip | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Estado de login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Verificar si ya está logueado
    if (typeof window !== 'undefined' && localStorage.getItem('admin_logged_in') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === 'admin' && loginPass === '1234') {
      setIsLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_logged_in', 'true');
      }
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_logged_in');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, allData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllClips()
      ]);
      setStats(statsData);
      setPendingClips(allData.clips as PendingClip[]);
    } catch (err) {
      setError('Error cargando datos del panel de administrador');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (clip: PendingClip) => {
    try {
      await adminApi.approveClip(clip.id.toString());
      setPendingClips(prev => prev.filter(c => c.id !== clip.id));
      if (stats) {
        setStats({
          ...stats,
          pending: stats.pending - 1,
          approved: stats.approved + 1
        });
      }
    } catch (err) {
      setError('Error aprobando el clip');
      console.error(err);
    }
  };

  const handleReject = async (clip: PendingClip) => {
    if (!rejectionReason.trim()) {
      setError('Debes proporcionar una razón para rechazar el clip');
      return;
    }

    try {
      await adminApi.rejectClip(clip.id.toString(), rejectionReason);
      setPendingClips(prev => prev.filter(c => c.id !== clip.id));
      if (stats) {
        setStats({
          ...stats,
          pending: stats.pending - 1,
          rejected: stats.rejected + 1
        });
      }
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedClip(null);
    } catch (err) {
      setError('Error rechazando el clip');
      console.error(err);
    }
  };

  const handleDelete = async (clip: PendingClip) => {
    try {
      await adminApi.deleteClip(clip.id.toString());
      setPendingClips(prev => prev.filter(c => c.id !== clip.id));
      if (stats) {
        setStats({
          ...stats,
          pending: stats.pending - 1,
          total: stats.total - 1
        });
      }
      setShowDeleteModal(false);
      setSelectedClip(null);
    } catch (err) {
      setError('Error borrando el clip');
      console.error(err);
    }
  };

  const openRejectModal = (clip: PendingClip) => {
    setSelectedClip(clip);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const openDeleteModal = (clip: PendingClip) => {
    setSelectedClip(clip);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Login Administrador</h2>
          {loginError && <div className="mb-4 text-red-600 text-sm">{loginError}</div>}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Usuario</label>
            <input
              type="text"
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Contraseña</label>
            <input
              type="password"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Panel de Administrador</h1>
            <button
              onClick={handleLogout}
              className="text-sm sm:text-base text-red-600 hover:text-red-700 font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className="text-sm sm:text-base text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-gray-600">Pendientes</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-gray-600">Aprobados</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-gray-600">Rechazados</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-gray-600">Total</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de clips */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Todos los clips</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando clips...</p>
            </div>
          ) : pendingClips.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No hay clips para mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Headers de tabla - ocultos en móvil */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4 sm:p-6 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                  <div className="col-span-4">Título</div>
                  <div className="col-span-2">Estado</div>
                  <div className="col-span-2">Personas</div>
                  <div className="col-span-2">Fecha</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>
                
                {/* Clips */}
                {pendingClips.map((clip) => (
                  <div key={clip.id} className="border-b border-gray-200 last:border-b-0">
                    {/* Desktop view */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4 sm:p-6 items-center">
                      {/* Miniatura + título/desc */}
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <img
                          src={getThumbnailUrl(clip.thumbnailPath)}
                          alt={clip.title}
                          className="w-16 h-10 object-cover rounded shadow border border-gray-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{clip.title}</h3>
                          {clip.description && (
                            <p className="text-sm text-gray-600 truncate">{clip.description}</p>
                          )}
                        </div>
                      </div>
                      {/* Estado */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          clip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          clip.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {clip.status === 'pending' ? 'Pendiente' :
                           clip.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                        </span>
                      </div>
                      {/* Personas */}
                      <div className="col-span-2">
                        {clip.persons && clip.persons.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {clip.persons.slice(0, 2).map((p, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                {p}
                              </span>
                            ))}
                            {clip.persons.length > 2 && (
                              <span className="text-xs text-gray-500">+{clip.persons.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Sin personas</span>
                        )}
                      </div>
                      {/* Fecha */}
                      <div className="col-span-2 text-sm text-gray-600">
                        {formatDate(clip.createdAt)}
                      </div>
                      {/* Acciones */}
                      <div className="col-span-2 flex justify-end space-x-2">
                        {clip.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(clip)}
                              className="btn-primary text-xs py-1 px-2"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Aprobar
                            </button>
                            <button
                              onClick={() => openRejectModal(clip)}
                              className="btn-secondary text-xs py-1 px-2"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openDeleteModal(clip)}
                          className="text-red-600 hover:text-red-700 text-xs py-1 px-2"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Borrar
                        </button>
                      </div>
                    </div>
                    
                    {/* Mobile view */}
                    <div className="sm:hidden p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <img
                            src={getThumbnailUrl(clip.thumbnailPath)}
                            alt={clip.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{clip.title}</h3>
                          {clip.description && (
                            <p className="text-xs text-gray-600 truncate mt-1">{clip.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              clip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              clip.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {clip.status === 'pending' ? 'Pendiente' :
                               clip.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                            </span>
                            
                            <span className="text-xs text-gray-500">
                              {formatDate(clip.createdAt)}
                            </span>
                          </div>
                          
                          {clip.persons && clip.persons.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {clip.persons.slice(0, 3).map((p, i) => (
                                <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                  {p}
                                </span>
                              ))}
                              {clip.persons.length > 3 && (
                                <span className="text-xs text-gray-500">+{clip.persons.length - 3}</span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex space-x-2 mt-3">
                            {clip.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(clip)}
                                  className="btn-primary text-xs py-1 px-2"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => openRejectModal(clip)}
                                  className="btn-secondary text-xs py-1 px-2"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Rechazar
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => openDeleteModal(clip)}
                              className="text-red-600 hover:text-red-700 text-xs py-1 px-2"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Borrar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && selectedClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Rechazar clip</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Por qué estás rechazando "{selectedClip.title}"?
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Escribe la razón del rechazo..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
              rows={3}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(selectedClip)}
                className="btn-primary text-sm py-2 px-4"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de borrado */}
      {showDeleteModal && selectedClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Borrar clip</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que quieres borrar "{selectedClip.title}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(selectedClip)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 