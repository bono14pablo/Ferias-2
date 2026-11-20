import React, { useEffect, useState } from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { Product } from './types/platform';
import { PublicHeader } from './components/public/PublicHeader';
import { PublicPortal } from './components/public/PublicPortal';
import { EntrepreneurProfilePage } from './components/public/EntrepreneurProfilePage';
import { FairDetailPage } from './components/public/FairDetailPage';
import { VisitorFavoritesView } from './components/public/VisitorFavoritesView';
import { ProductDetailModal } from './components/public/ProductDetailModal';
import { ReportModal } from './components/public/ReportModal';
import { AuthModal } from './components/auth/AuthModal';
import { VendorPanel } from './components/vendor/VendorPanel';
import { AdminPanel } from './components/admin/AdminPanel';

type AppRoute =
  | { type: 'home' }
  | { type: 'entrepreneur'; slug: string }
  | { type: 'fair'; slug: string }
  | { type: 'favorites' }
  | { type: 'panel' };

function parsePathToRoute(pathname: string): AppRoute {
  if (pathname.startsWith('/emprendimiento/')) {
    const slug = pathname.replace('/emprendimiento/', '').split('/')[0];
    if (slug) return { type: 'entrepreneur', slug };
  }
  if (pathname.startsWith('/feria/')) {
    const slug = pathname.replace('/feria/', '').split('/')[0];
    if (slug) return { type: 'fair', slug };
  }
  if (pathname === '/favoritos') return { type: 'favorites' };
  if (pathname === '/panel') return { type: 'panel' };
  return { type: 'home' };
}

const AppShell: React.FC = () => {
  const { state, currentUser, toastMessage } = usePlatform();

  const [route, setRoute] = useState<AppRoute>(() =>
    parsePathToRoute(window.location.pathname)
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reportTarget, setReportTarget] = useState<{
    type: 'emprendimiento' | 'producto';
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const onPopState = () => {
      setRoute(parsePathToRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (nextRoute: AppRoute, path: string, scrollSectionId?: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(nextRoute);
    if (scrollSectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(scrollSectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  const handleOpenPanel = () => {
    if (!currentUser) {
      setAuthInitialTab('login');
      setAuthModalOpen(true);
      return;
    }
    if (currentUser.role === 'visitante') {
      navigateTo({ type: 'favorites' }, '/favoritos');
      return;
    }
    navigateTo({ type: 'panel' }, '/panel');
  };

  // If currently on /panel and logged in as Vendor / Mod / Admin / Superadmin
  if (route.type === 'panel' && currentUser && currentUser.role !== 'visitante') {
    return (
      <>
        {currentUser.role === 'vendedor' ? (
          <VendorPanel
            onBackToPortal={() => navigateTo({ type: 'home' }, '/')}
            onViewPublicStorefront={(slug) =>
              navigateTo({ type: 'entrepreneur', slug }, `/emprendimiento/${slug}`)
            }
          />
        ) : (
          <AdminPanel onBackToPortal={() => navigateTo({ type: 'home' }, '/')} />
        )}

        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 right-4 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg"
          >
            {toastMessage}
          </div>
        )}
      </>
    );
  }

  const productEntrepreneur = selectedProduct
    ? state.entrepreneurs.find((e) => e.id === selectedProduct.entrepreneurId) || null
    : null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141619]">
      <PublicHeader
        onNavigateHome={(sectionId) => navigateTo({ type: 'home' }, '/', sectionId)}
        onOpenAuth={() => {
          setAuthInitialTab('login');
          setAuthModalOpen(true);
        }}
        onOpenPanel={handleOpenPanel}
        onOpenFavorites={() => navigateTo({ type: 'favorites' }, '/favoritos')}
      />

      <main>
        {route.type === 'home' && (
          <PublicPortal
            onSelectEntrepreneur={(slug) =>
              navigateTo({ type: 'entrepreneur', slug }, `/emprendimiento/${slug}`)
            }
            onSelectFair={(slug) =>
              navigateTo({ type: 'fair', slug }, `/feria/${slug}`)
            }
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            onOpenRegisterVendor={() => {
              if (currentUser && currentUser.role === 'vendedor') {
                navigateTo({ type: 'panel' }, '/panel');
              } else {
                setAuthInitialTab('register');
                setAuthModalOpen(true);
              }
            }}
            onRequireAuth={() => {
              setAuthInitialTab('login');
              setAuthModalOpen(true);
            }}
          />
        )}

        {route.type === 'entrepreneur' && (
          <EntrepreneurProfilePage
            slug={route.slug}
            onBack={() => navigateTo({ type: 'home' }, '/')}
            onSelectFair={(fairSlug) =>
              navigateTo({ type: 'fair', slug: fairSlug }, `/feria/${fairSlug}`)
            }
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            onRequireAuth={() => {
              setAuthInitialTab('login');
              setAuthModalOpen(true);
            }}
            onReportTarget={(target) => setReportTarget(target)}
          />
        )}

        {route.type === 'fair' && (
          <FairDetailPage
            slug={route.slug}
            onBack={() => navigateTo({ type: 'home' }, '/')}
            onSelectEntrepreneur={(slug) =>
              navigateTo({ type: 'entrepreneur', slug }, `/emprendimiento/${slug}`)
            }
            onRequireAuth={() => {
              setAuthInitialTab('login');
              setAuthModalOpen(true);
            }}
          />
        )}

        {route.type === 'favorites' && (
          <VisitorFavoritesView
            onBack={() => navigateTo({ type: 'home' }, '/')}
            onSelectEntrepreneur={(slug) =>
              navigateTo({ type: 'entrepreneur', slug }, `/emprendimiento/${slug}`)
            }
          />
        )}
      </main>

      <ProductDetailModal
        product={selectedProduct}
        entrepreneur={productEntrepreneur}
        onClose={() => setSelectedProduct(null)}
        onNavigateEntrepreneur={(slug) =>
          navigateTo({ type: 'entrepreneur', slug }, `/emprendimiento/${slug}`)
        }
        onReportProduct={(prod) => {
          setSelectedProduct(null);
          setReportTarget({
            type: 'producto',
            id: prod.id,
            name: prod.name,
          });
        }}
      />

      <ReportModal
        target={reportTarget}
        onClose={() => setReportTarget(null)}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialTab={authInitialTab}
        initialRegisterRole="vendedor"
        onClose={() => setAuthModalOpen(false)}
        onSuccessNavigateToPanel={() => navigateTo({ type: 'panel' }, '/panel')}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 px-4 py-2.5 bg-[#141619] text-white text-xs font-medium rounded-xl shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <PlatformProvider>
      <AppShell />
    </PlatformProvider>
  );
}

export default App;
