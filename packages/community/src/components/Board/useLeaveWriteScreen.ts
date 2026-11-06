import { useNavigate, useRouter } from '@tanstack/react-router';

/**
 * Leaves a board's `?status=create` screen. Goes back when it was opened
 * from the list; when the URL was opened directly, there is nothing to go
 * back to, so it drops `status` instead.
 */
export default function useLeaveWriteScreen() {
  const router = useRouter();
  const navigate = useNavigate({ from: '/board/$board_id' });

  return () => {
    if (router.history.canGoBack()) router.history.back();
    else
      navigate({
        search: (prev) => ({ ...prev, status: undefined }),
        replace: true,
      });
  };
}
