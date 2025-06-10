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
    <li className="group text-white h-full md:h-auto" tabIndex={0}>
      <div
        className={`flex items-center relative py-0 md:py-2 px-2 md:px-3 md:mx-[10px] cursor-pointer h-full md:h-auto
          before:hidden md:before:block before:absolute before:border-0 before:border-solid before:transition-all before:duration-300 before:ease-in-out before:content-[''] before:h-[3px] before:w-0 before:border-b-[3px] before:border-[#FAD55F] before:bottom-[3px] before:right-1/2 group-hover:before:w-1/2
          after:hidden md:after:block after:absolute after:border-0 after:border-solid after:transition-all after:duration-300 after:ease-in-out after:content-[''] after:h-[3px] after:w-0 after:border-b-[3px] after:border-[#FAD55F] after:bottom-[3px] after:left-1/2 group-hover:after:w-1/2`}
      >
        {menuName}
      </div>
      {accessibleMenuItems && (
        <div className="absolute left-0 md:left-auto w-full md:w-auto top-full max-h-0 group-focus:max-h-[400px] group-hover:max-h-[400px] bg-[#fDEED5] md:bg-[#FAD55F] z-10 text-[#05070E] md:text-white overflow-hidden transition-all duration-300 ease-in-out shadow-[0_1px_5px_0_rgba(0,0,0,0.15)]">
          <ul className="w-full md:w-[200px] z-10 flex md:block flex-wrap">
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
