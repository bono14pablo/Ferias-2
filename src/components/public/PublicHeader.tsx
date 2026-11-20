import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

interface PublicHeaderProps {
  onNavigateHome: (sectionId?: string) => void;
  onOpenAuth: () => void;
  onOpenPanel: () => void;
  onOpenFavorites: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  onNavigateHome,
  onOpenAuth,
  onOpenPanel,
  onOpenFavorites,
}) => {
  const { currentUser, logout } = usePlatform();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Emprendimientos', target: 'emprendimientos' },
    { label: 'Productos', target: 'productos' },
    { label: 'Ferias', target: 'ferias' },
    { label: 'Promociones', target: 'promociones' },
    { label: 'Sumate', target: 'sumate' },
  ];

  const handlePrimaryClick = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (currentUser.role === 'visitante') {
      onOpenFavorites();
      return;
    }
    onOpenPanel();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigateHome()}
          className="font-display text-xl font-bold tracking-tight text-[#141619] whitespace-nowrap shrink-0 cursor-pointer"
        >
          FeriaLocal
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4B5563]"
        >
          {navItems.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => onNavigateHome(item.target)}
              className="hover:text-[#141619] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrimaryClick}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0F5C4D] hover:bg-[#0B473B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {!currentUser
              ? 'Ingresar'
              : currentUser.role === 'visitante'
              ? 'Mis favoritos'
              : 'Mi panel'}
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Abrir menú"
          className="md:hidden p-2 rounded-lg text-[#141619] hover:bg-[#EFECE6]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateHome(item.target);
                }}
                className="text-left py-2 text-sm font-medium text-[#141619]"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handlePrimaryClick();
              }}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-[#0F5C4D] rounded-lg"
            >
              {!currentUser
                ? 'Ingresar'
                : currentUser.role === 'visitante'
                ? 'Mis favoritos'
                : 'Mi panel'}
            </button>
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="py-2.5 px-3 text-sm font-medium text-[#5C636E] border border-[#E5E7EB] rounded-lg"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
