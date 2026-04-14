import { Board } from '~/services/types';
import { MenuLink } from './types';
import { Link } from '@tanstack/react-router';
import useDeviceType, { DeviceType } from '~/hooks/useDeviceType';

type Props = {
  item: Board | MenuLink;
};

function MenuItem(props: Props) {
  const { item } = props;

  const deviceType = useDeviceType();

  const baseClasses =
    'block w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors duration-200';

  return (
    <li className="list-none">
      {'board_id' in item ? (
        <Link
          to="/board/$board_id"
          params={{ board_id: item.board_id }}
          className={baseClasses}
        >
          {item.board_name}
        </Link>
      ) : item.isExternal ? (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className={`${baseClasses} flex items-center justify-between`}
        >
          {deviceType === DeviceType.Mobile
            ? (item.shortName ?? item.name)
            : item.name}
          <i className="ri-external-link-line text-white/40 text-xs"></i>
        </a>
      ) : (
        <Link to={item.url} className={baseClasses}>
          {deviceType === DeviceType.Mobile
            ? (item.shortName ?? item.name)
            : item.name}
        </Link>
      )}
    </li>
  );
}

export default MenuItem;
