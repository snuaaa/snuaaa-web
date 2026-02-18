import { FC, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import Loading from '~/components/Common/Loading';
import PhotoList from '~/components/Album/PhotoList';
import AlbumInfo from '~/components/Album/AlbumInfo';
import { EditAlbum } from '~/components/Album/modals/EditAlbum';
import CreatePhotoModal from '~/components/Photo/CreateModal';
import BoardName from '~/components/Board/BoardName';

import {
  useAlbum,
  useDeleteAlbum,
  albumKeys,
} from '~/hooks/queries/useAlbumQueries';
import { useAuth } from '~/contexts/auth';
import { Divider } from '~/ui';
import { useQueryClient } from '@tanstack/react-query';

const AlbumPage: FC = () => {
  const { album_id: albumId } = useParams({ from: '/album/$album_id' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const authContext = useAuth();

  const { data } = useAlbum(Number(albumId));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const albumData = data?.albumData;
  const photos = data?.photos;

  const albumInfo = useMemo(() => albumData?.albumInfo, [albumData?.albumInfo]);

  const categoryInfo = useMemo(
    () => albumData?.categoryInfo,
    [albumData?.categoryInfo],
  );

  const tagInfo = useMemo(() => albumData?.tagInfo, [albumData?.tagInfo]);

  const deleteAlbumMutation = useDeleteAlbum();

  const deleteAlbum = useCallback(async () => {
    if (!albumInfo) {
      return;
    }
    const goDrop = window.confirm(
      '정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.',
    );
    if (goDrop) {
      try {
        await deleteAlbumMutation.mutateAsync(Number(albumId));
        navigate({ to: `/board/${albumInfo.board_id}`, replace: true });
      } catch (err) {
        console.error(err);
        alert('삭제 실패');
      }
    }
  }, [albumId, albumInfo, navigate, deleteAlbumMutation]);

  const invalidateAlbum = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: albumKeys.detail(Number(albumId)),
    });
  }, [queryClient, albumId]);

  const handleUpdateAlbum = useCallback(() => {
    setIsEditing(false);
    invalidateAlbum();
  }, [invalidateAlbum]);

  const handleCreatePhoto = useCallback(() => {
    invalidateAlbum();
    setIsModalOpen(false);
  }, [invalidateAlbum]);

  if (!albumInfo || !photos) {
    return <Loading />;
  }

  return (
    <>
      <BoardName
        board_id={albumInfo.board.board_id}
        board_name={albumInfo.board.board_name}
      />
      <div className="album-wrapper">
        <AlbumInfo
          albumContent={albumInfo}
          my_id={authContext.authInfo.user.user_id}
          onClickEdit={() => setIsEditing(true)}
          onClickDelete={deleteAlbum}
        />
        {(!albumInfo.album.is_private ||
          authContext.authInfo.user.user_id === albumInfo.user.user_id) && (
          <button
            className="board-btn-write"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-image-line enif-f-1p2x"></i>사진 업로드
          </button>
        )}
        <Divider />
        <PhotoList photos={photos} />
        {isModalOpen && (
          <CreatePhotoModal
            albumId={albumInfo.content_id}
            boardId={albumInfo.board_id}
            tags={tagInfo}
            onCreatePhoto={handleCreatePhoto}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
        {isEditing && (
          <EditAlbum
            albumInfo={albumInfo}
            categoryInfo={categoryInfo}
            onUpdateAlbum={handleUpdateAlbum}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </div>
      {/* <Route path="/album/:album_id/photo/:photo_id" component={Photo} /> */}
    </>
  );
};

export default AlbumPage;
