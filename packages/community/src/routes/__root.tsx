import {
  createRootRoute,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import React, { Suspense, useCallback } from 'react';

import '../App.scss';
import '../index.css';

import { ViewportSizeProvider } from '../contexts/viewportSize';
import AppShell from '~/components/Layout/AppShell';
import FullScreenPortal from '~/components/Common/FullScreenPortal';
import ExhibitPhotoDetailModal from '~/components/Exhibition/ExhibitPhotoDetail';
import PhotoDetailModal from '~/components/Photo/PhotoDetail';
import useVirtualKeyboard from '~/hooks/useVirtualKeyboard';
import Loading from '~/components/Common/Loading';
import { loadSession, PUBLIC_PATHS } from '~/lib/auth';
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
  // 모든 라우트의 loader보다 먼저 실행되므로, 로그인하지 않은 사용자는
  // 보호된 페이지의 데이터 요청 없이 바로 로그인 페이지로 이동한다.
  beforeLoad: async ({ location }) => {
    const session = await loadSession();
    if (!session && !PUBLIC_PATHS.includes(location.pathname)) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
        replace: true,
      });
    }
  },
  pendingComponent: Loading,
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
  useVirtualKeyboard();

  // Auth pages render without the site chrome
  const isBarePage = location.pathname.startsWith('/auth');

  return (
    <>
      <div className="min-h-full flex flex-col">
        <ViewportSizeProvider>
          {isBarePage ? (
            <Outlet />
          ) : (
            <AppShell>
              <Outlet />
            </AppShell>
          )}
          {photo && <PhotoModal photoId={photo} navigation={photoNavigation} />}
          {exhibitPhoto && <ExhibitPhotoModal exhibitPhotoId={exhibitPhoto} />}
        </ViewportSizeProvider>
      </div>
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}
