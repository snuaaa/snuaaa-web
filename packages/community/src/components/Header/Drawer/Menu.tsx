import { Board } from '~/services/types';
import { MenuLink } from '../Navigation/types';
import { useAuth } from '~/contexts/auth';
import MenuItem from './MenuItem';
import { ReactElement } from 'react';

type Props = {
  menuName: string;
  menuItems: Board[] | MenuLink[];
  icon: ReactElement;
};

function Menu({ menuName, menuItems, icon }: Props) {
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
    <li className="px-2 bg-slate-700">
      <input type="checkbox" id={menuName} className="hidden peer" />
      <label
        htmlFor={menuName}
        className="cursor-pointer font-extrabold flex items-center gap-2"
      >
        {icon}
        {menuName}
      </label>
      <div className="text-sm max-h-0 overflow-hidden peer-checked:max-h-[1000px] transition-all duration-300 ease-in-out">
        <ul className="flex flex-col gap-3 pt-4">
          {accessibleMenuItems.map((item) => (
            <MenuItem
              item={item}
              key={'board_id' in item ? item.board_id : item.name}
            />
          ))}
        </ul>
      </div>
    </li>
  );
}

export default Menu;
