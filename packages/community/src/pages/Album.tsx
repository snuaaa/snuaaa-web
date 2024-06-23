import { FC, useCallback, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import Loading from 'components/Common/Loading';
import PhotoList from 'components/Album/PhotoList';
import AlbumInfo from 'components/Album/AlbumInfo';
import { EditAlbum } from 'components/Album/modals/EditAlbum';
import { CreatePhoto } from 'components/Photo/CreatePhoto';
import BoardName from 'components/Board/BoardName';
import AlbumService from 'services/AlbumService';

import { useFetch } from 'hooks/useFetch';
import { useAuth } from 'contexts/auth';
import { Divider } from 'ui';

const AlbumPage: FC = () => {
  const { album_id: albumId } = useParams<{ album_id: string }>();
  const history = useHistory();

  const authContext = useAuth();

  const fetchFunction = useCallback(async () => {
    return await Promise.all([
      AlbumService.retrieveAlbum(Number(albumId)),
      AlbumService.retrievePhotosInAlbum(Number(albumId)),
    ]);
  }, [albumId]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [albumData, photos] = data ?? [];

  const albumInfo = useMemo(() => albumData?.albumInfo, [albumData?.albumInfo]);

  const categoryInfo = useMemo(
    () => albumData?.categoryInfo,
    [albumData?.categoryInfo],
  );

  const tagInfo = useMemo(() => albumData?.tagInfo, [albumData?.tagInfo]);

  const deleteAlbum = useCallback(async () => {
    if (!albumInfo) {
      return;
    }
    const goDrop = window.confirm(
      '정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.',
    );
    if (goDrop) {
      try {
        await AlbumService.deleteAlbum(Number(albumId));
        history.replace(`/board/${albumInfo.board_id}`);
      } catch (err) {
        console.error(err);
        alert('삭제 실패');
      }
    }
  }, [albumId, albumInfo, history]);

  const handleUpdateAlbum = useCallback(() => {
    setIsEditing(false);
    refresh();
  }, [refresh]);

  const handleCreatePhoto = useCallback(() => {
    refresh();
    setIsModalOpen(false);
  }, [refresh]);

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
          albumInfo={albumInfo}
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
          <CreatePhoto
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
