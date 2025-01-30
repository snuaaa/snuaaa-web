import { Board } from 'services/types';
import { MenuLink } from './types';
import { Link } from 'react-router-dom';
import useDeviceType, { DeviceType } from 'hooks/useDeviceType';

type Props = {
  item: Board | MenuLink;
};

function MenuItem(props: Props) {
  const { item } = props;

  const deviceType = useDeviceType();

  return (
    <li className="text-left relative md:font-bold md:[text-shadow:_0_0_3px_#E6AD0F] transition-all duration-300 hover:bg-[#FCE8A7] hover:text-[#646464] md:hover:[text-shadow:none]">
      {'board_id' in item ? (
        <Link
          to={`/board/${item.board_id}`}
          className="w-full p-2.5 inline-block"
        >
          {item.board_name}
        </Link>
      ) : item.isExternal ? (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="w-full p-2.5 flex items-center justify-between"
        >
          {deviceType === DeviceType.Mobile
            ? item.shortName ?? item.name
            : item.name}
          <i className="ri-external-link-line"></i>
        </a>
      ) : (
        <Link to={item.url} className="w-full p-2.5 inline-block">
          {deviceType === DeviceType.Mobile
            ? item.shortName ?? item.name
            : item.name}
        </Link>
      )}
    </li>
  );
}

export default MenuItem;
