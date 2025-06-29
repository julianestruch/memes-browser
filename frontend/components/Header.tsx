'use client';

import Link from 'next/link';
import { Search, Upload, Play, Database } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              ClipSearch
            </span>
          </Link>

          {/* Navegación */}
          <nav className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </Link>
            
            <Link 
              href="/repository" 
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              <Database className="w-4 h-4" />
              <span>Repositorio</span>
            </Link>
            
            <Link 
              href="/upload" 
              className="flex items-center space-x-1 bg-primary-600 text-white hover:bg-primary-700 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Clip</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
} 