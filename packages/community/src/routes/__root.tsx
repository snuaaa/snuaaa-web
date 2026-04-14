import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useCallback } from 'react';

import '../App.scss';
import '../index.css';

import { AuthProvider } from '../contexts/auth';

import { ViewportSizeProvider } from '../contexts/viewportSize';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FullScreenPortal from '~/components/Common/FullScreenPortal';
import PhotoDetailModal from '~/components/Photo/DetailModal';
import { queryClient } from '~/lib/queryClient';

const ExhibitPhotoPage = React.lazy(() => import('~/pages/ExhibitPhoto'));

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

type SearchParams = {
  photo?: number;
  exhibitPhoto?: number;
};

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    photo: search.photo ? Number(search.photo) : undefined,
    exhibitPhoto: search.exhibitPhoto ? Number(search.exhibitPhoto) : undefined,
  }),
  component: RootComponent,
});

function PhotoModal({ photoId }: { photoId: number }) {
  const router = useRouter();
  const navigate = useNavigate();

  const handleMovePhoto = useCallback(
    (newPhotoId: number) => {
      navigate({
        to: '.',
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          photo: newPhotoId,
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const handleClosePhoto = useCallback(() => {
    if (window.history.length > 2) {
      router.history.back();
    } else {
      navigate({ to: '/' });
    }
  }, [router, navigate]);

  return (
    <FullScreenPortal>
      <PhotoDetailModal
        photoId={photoId}
        onClose={handleClosePhoto}
        onMovePhoto={handleMovePhoto}
      />
    </FullScreenPortal>
  );
}

function ExhibitPhotoModal({ exhibitPhotoId }: { exhibitPhotoId: number }) {
  return (
    <Suspense fallback={null}>
      <ExhibitPhotoPage exhibitPhotoId={exhibitPhotoId} />
    </Suspense>
  );
}

function RootComponent() {
  const location = useLocation();
  const { photo, exhibitPhoto } = Route.useSearch();

  // Check if the current path is an auth path (login or signup)
  const isAuthPage = location.pathname.startsWith('/auth');
  const isHomePage = location.pathname === '/';
  const isPostPage = location.pathname.startsWith('/post');
  const isFullWidthPage = isHomePage || isPostPage;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-full flex flex-col">
        <ViewportSizeProvider>
          <AuthProvider>
            {isAuthPage ? (
              <Outlet />
            ) : isFullWidthPage ? (
              <>
                <Header />
                <Outlet />
                <Footer />
              </>
            ) : (
              <>
                <Header />
                <div className="section-wrapper">
                  <section>
                    <Outlet />
                  </section>
                </div>
                <Footer />
              </>
            )}
            {photo && <PhotoModal photoId={photo} />}
            {exhibitPhoto && (
              <ExhibitPhotoModal exhibitPhotoId={exhibitPhoto} />
            )}
          </AuthProvider>
        </ViewportSizeProvider>
      </div>
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </QueryClientProvider>
  );
}
