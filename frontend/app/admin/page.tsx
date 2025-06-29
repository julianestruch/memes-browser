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
  const [deletePassword, setDeletePassword] = useState('');
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
    if (deletePassword !== 'admin123') {
      setError('Contraseña incorrecta para borrar');
      return;
    }

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
      setDeletePassword('');
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
    setDeletePassword('');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">Login Administrador</h2>
          {loginError && <div className="mb-4 text-red-600 text-sm">{loginError}</div>}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Usuario</label>
            <input
              type="text"
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administrador</h1>
            <p className="text-gray-600">Gestiona y aprueba clips subidos por los usuarios</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aprobados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rechazados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Clips Pendientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Todos los Clips</h2>
            <p className="text-sm text-gray-600 mt-1">
              {pendingClips.length} clips en total
            </p>
          </div>

          {pendingClips.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡No hay clips!</h3>
              <p className="text-gray-600">No hay clips en la base de datos.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingClips.map((clip) => (
                <div key={clip.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <img
                        src={getThumbnailUrl(clip.thumbnailPath)}
                        alt={clip.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    </div>

                    {/* Información del clip */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {clip.title}
                      </h3>
                      {clip.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {clip.description}
                        </p>
                      )}
                      {clip.persons && clip.persons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {clip.persons.map((person, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                              {person}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Subido el {formatDate(clip.createdAt)}
                      </p>
                      <p className="text-xs mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs ${clip.status === 'approved' ? 'bg-green-600' : clip.status === 'pending' ? 'bg-yellow-500' : 'bg-red-600'}`}>{clip.status}</span>
                      </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex-shrink-0 flex space-x-2">
                      {clip.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(clip)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </button>
                      )}
                      {clip.status === 'pending' && (
                        <button
                          onClick={() => openRejectModal(clip)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(clip)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Rechazo */}
      {showRejectModal && selectedClip && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rechazar Clip: {selectedClip.title}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón del rechazo:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Explica por qué rechazas este clip..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedClip(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleReject(selectedClip)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Borrado */}
      {showDeleteModal && selectedClip && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Borrar Clip Permanentemente: {selectedClip.title}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  ⚠️ Esta acción es irreversible. El clip será eliminado permanentemente de la base de datos y de Cloudinary.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña de administrador:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin123"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedClip(null);
                    setDeletePassword('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(selectedClip)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Borrar Permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 