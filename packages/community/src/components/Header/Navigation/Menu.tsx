import { Board } from 'services/types';
import { MenuLink } from './types';
import MenuItem from './MenuItem';
import { ReactElement } from 'react';

type Props = {
  menuName: string | ReactElement;
  menuItems?: Board[] | MenuLink[];
};

function Menu({ menuName, menuItems }: Props) {
  return (
    <li className="group inline-block text-white bg-[#000E2C]">
      <div
        className="block relative h-[35px] pt-[13px] px-3 mx-[10px] cursor-pointer
          before:absolute before:border-0 before:border-solid before:transition-all before:duration-300 before:ease-in-out before:content-[''] before:h-[3px] before:w-0 before:border-b-[3px] before:border-[#FAD55F] before:bottom-[-2px] before:right-1/2 group-hover:before:w-1/2
          after:absolute after:border-0 after:border-solid after:transition-all after:duration-300 after:ease-in-out after:content-[''] after:h-[3px] after:w-0 after:border-b-[3px] after:border-[#FAD55F] after:bottom-[-2px] after:left-1/2 group-hover:after:w-1/2"
      >
        {menuName}
      </div>
      {menuItems && (
        <div className="absolute top-full max-h-0 group-hover:max-h-[400px] bg-[#FAD55F] z-10 text-white overflow-hidden transition-all duration-300 ease-in-out shadow-[1_1_5_0_rgba(0,0,0,0.15)]">
          <ul className="w-[200px] z-10">
            {menuItems.map((item) => (
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
