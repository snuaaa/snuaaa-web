import { Board } from '~/services/types';
import { MenuLink } from '../Navigation/types';
import { Link } from 'react-router-dom';
import { useDrawer } from '~/components/Common/Drawer/useDrawer';

type Props = {
  item: Board | MenuLink;
};

const baseItemStyle =
  'block w-full pl-4 py-2 pr-4 whitespace-nowrap border-l border-slate-500 hover:bg-slate-500 transition-colors duration-200';

function MenuItem(props: Props) {
  const { item } = props;

  const { onClose } = useDrawer();

  return (
    <li className="pl-6 bg-slate-700">
      {'board_id' in item ? (
        <Link
          to={`/board/${item.board_id}`}
          className={baseItemStyle}
          onClick={onClose}
        >
          {item.board_name}
        </Link>
      ) : item.isExternal ? (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className={`${baseItemStyle} flex items-center justify-between`}
        >
          {item.name}
          <i className="ri-external-link-line"></i>
        </a>
      ) : (
        <Link to={item.url} className={baseItemStyle} onClick={onClose}>
          {item.name}
        </Link>
      )}
    </li>
  );
}

export default MenuItem;
