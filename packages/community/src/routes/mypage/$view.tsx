import { createFileRoute } from '@tanstack/react-router';
import MyPage from '../../pages/MyPage';

export const Route = createFileRoute('/mypage/$view')({
  component: MyPage,
});
