import { useRouter } from '@tanstack/react-router';
import { breakLine } from '../../utils/breakLine';
import ActionDrawer from '../Common/ActionDrawer';
import { Album } from '~/services/types';

type AlbumInfoProps = {
  albumContent: Album;
  my_id: number;
  onClickEdit: () => void;
  onClickDelete: () => void;
};

function AlbumInfo({
  albumContent,
  my_id,
  onClickEdit,
  onClickDelete,
}: AlbumInfoProps) {
  const { history } = useRouter();
  const { album, user, text, title, board_id } = albumContent;

  const handleClickBack = () => {
    if (history.canGoBack()) {
      history.back();
    } else {
      history.replace(`/board/${board_id}`);
    }
  };

  return (
    <>
      <div className="album-info-wrapper">
        <div className="alb-title-wrapper">
          <div className="alb-btn-back">
            <button onClick={handleClickBack}>
              <i className="ri-arrow-left-line"></i>
            </button>
          </div>
          <h5 className="alb-title">{title}</h5>
          <i
            className={`${album.is_private ? 'ri-user-fill' : 'ri-group-fill'} color-gray1 text-base`}
          ></i>
          {my_id === user.user_id && (
            <ActionDrawer clickEdit={onClickEdit} clickDelete={onClickDelete} />
          )}
          <p className="alb-author">{user.nickname}</p>
        </div>
        <div>
          <p className="contents">{breakLine(text)}</p>
        </div>
      </div>
    </>
  );
}

export default AlbumInfo;
