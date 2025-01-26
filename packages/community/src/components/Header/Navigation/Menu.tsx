import useDeviceType, { DeviceType } from 'hooks/useDeviceType';
import { Link } from 'react-router-dom';
import { Board } from 'services/types';

export type MenuLink = {
  name: string;
  url: string;
  shortName?: string;
  isExternal?: boolean;
};

type MenuItem =
  | {
      boards: Board[];
    }
  | {
      links: MenuLink[];
    };

type Props = {
  menuName: string;
} & MenuItem;

function Menu(props: Props) {
  const { menuName } = props;

  const deviceType = useDeviceType();

  return (
    <li className="menu-nav">
      <div className="menu-item-1">
        <span>{menuName}</span>
      </div>
      <div className="menu-nav-sub">
        <ul>
          {'boards' in props &&
            props.boards.map((board) => (
              <Link to={`/board/${board.board_id}`} key={board.board_id}>
                <li>{board.board_name}</li>
              </Link>
            ))}
          {'links' in props &&
            props.links.map((link) => (
              <li key={link.name}>
                {link.isExternal ? (
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {deviceType === DeviceType.Mobile
                      ? link.shortName ?? link.name
                      : link.name}
                  </a>
                ) : (
                  <Link to={link.url}>{link.name}</Link>
                )}
              </li>
            ))}
        </ul>
      </div>
    </li>
  );
}

export default Menu;
