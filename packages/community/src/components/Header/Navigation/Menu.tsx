import { Board } from '~/services/types';
import { MenuLink } from './types';
import MenuItem from './MenuItem';
import { ReactElement } from 'react';
import { useAuth } from '~/contexts/auth';

type Props = {
  menuName: string | ReactElement;
  menuItems?: Board[] | MenuLink[];
};

function Menu({ menuName, menuItems }: Props) {
  const {
    authInfo: {
      user: { grade: userGrade },
    },
  } = useAuth();

  const accessibleMenuItems = menuItems?.filter((item) => {
    if ('board_id' in item) {
      return userGrade <= item.lv_read;
    }

    if (item.accessGrade) {
      return userGrade <= item.accessGrade;
    }

    return true;
  });

  return (
    <li
      className="group text-white/80 hover:text-white h-full list-none relative"
      tabIndex={0}
    >
      <div className="flex items-center px-3 md:px-4 h-full cursor-pointer text-sm font-medium tracking-wide transition-colors duration-200">
        {menuName}
      </div>
      {accessibleMenuItems && (
        <div className="absolute left-0 top-full w-[220px] max-h-0 group-focus:max-h-[500px] group-hover:max-h-[500px] overflow-hidden transition-all duration-300 ease-in-out z-20">
          <ul className="mt-1 bg-[#1a2d4d]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] py-1.5 overflow-hidden">
            {accessibleMenuItems.map((item) => (
              <MenuItem
                key={'board_id' in item ? item.board_id : item.name}
                item={item}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default Menu;
