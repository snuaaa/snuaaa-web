import { Board } from '~/services/types';
import { MenuLink } from '../Navigation/types';
import { Link } from 'react-router-dom';

type Props = {
  item: Board | MenuLink;
};

const baseItemStyle = 'w-full pl-8 whitespace-nowrap';

function MenuItem(props: Props) {
  const { item } = props;

  return (
    <li>
      {'board_id' in item ? (
        <Link to={`/board/${item.board_id}`} className={baseItemStyle}>
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
        <Link to={item.url} className={baseItemStyle}>
          {item.name}
        </Link>
      )}
    </li>
  );
}

export default MenuItem;
