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
import AppShell from '~/components/Layout/AppShell';
import FullScreenPortal from '~/components/Common/FullScreenPortal';
import ExhibitPhotoDetailModal from '~/components/Exhibition/ExhibitPhotoDetail';
import PhotoDetailModal from '~/components/Photo/PhotoDetail';
import { queryClient } from '~/lib/queryClient';
import { PhotoNavigationScope } from '~/services/PhotoService';

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
  photoNavigation?: PhotoNavigationScope;
  exhibitPhoto?: number;
};

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    photo: search.photo ? Number(search.photo) : undefined,
    photoNavigation:
      search.photoNavigation === 'user' ? search.photoNavigation : undefined,
    exhibitPhoto: search.exhibitPhoto ? Number(search.exhibitPhoto) : undefined,
  }),
  component: RootComponent,
});

function PhotoModal({
  photoId,
  navigation,
}: {
  photoId: number;
  navigation?: PhotoNavigationScope;
}) {
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
        navigation={navigation}
        onClose={handleClosePhoto}
        onMovePhoto={handleMovePhoto}
      />
    </FullScreenPortal>
  );
}

function ExhibitPhotoModal({ exhibitPhotoId }: { exhibitPhotoId: number }) {
  const router = useRouter();
  const navigate = useNavigate();

  const handleMovePhoto = useCallback(
    (newPhotoId: number) => {
      navigate({
        to: '.',
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          exhibitPhoto: newPhotoId,
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
      <ExhibitPhotoDetailModal
        exhibitPhotoId={exhibitPhotoId}
        onClose={handleClosePhoto}
        onMovePhoto={handleMovePhoto}
      />
    </FullScreenPortal>
  );
}

function RootComponent() {
  const location = useLocation();
  const { photo, photoNavigation, exhibitPhoto } = Route.useSearch();

  // Auth pages render without the site chrome
  const isBarePage = location.pathname.startsWith('/auth');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-full flex flex-col">
        <ViewportSizeProvider>
          <AuthProvider>
            {isBarePage ? (
              <Outlet />
            ) : (
              <AppShell>
                <Outlet />
              </AppShell>
            )}
            {photo && (
              <PhotoModal photoId={photo} navigation={photoNavigation} />
            )}
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
