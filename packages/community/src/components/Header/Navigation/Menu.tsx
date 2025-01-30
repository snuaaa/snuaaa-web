import { Board } from 'services/types';
import { MenuLink } from './types';
import MenuItem from './MenuItem';

type MenuItemsType =
  | {
      boards: Board[];
    }
  | {
      links: MenuLink[];
    };

type Props = {
  menuName: string;
} & MenuItemsType;

function Menu(props: Props) {
  const { menuName } = props;

  return (
    <li className="group inline-block text-white bg-[#000E2C]">
      <div
        className="block relative h-[35px] pt-[13px] px-3 mx-[10px] cursor-pointer
          before:absolute before:border-0 before:border-solid before:border-transparent before:transition-all before:duration-300 before:ease-in-out before:content-[''] before:h-6 before:w-0 before:border-b-[3px] before:border-[#FAD55F] before:bottom-[-2px] before:right-1/2 group-hover:before:w-1/2
          after:absolute after:border-0 after:border-solid after:border-transparent after:transition-all after:duration-300 after:ease-in-out after:content-[''] after:h-6 after:w-0 after:border-b-[3px] after:border-[#FAD55F] after:bottom-[-2px] after:left-1/2 group-hover:after:w-1/2"
      >
        {menuName}
      </div>
      <div className="absolute top-full max-h-0 group-hover:max-h-[400px] bg-[#FAD55F] z-10 text-white overflow-hidden transition-all duration-300 ease-in-out shadow-[1_1_5_0_rgba(0,0,0,0.15)]">
        <ul className="w-[200px] z-10">
          {('boards' in props &&
            props.boards.map((board) => (
              <MenuItem key={board.board_id} item={board} />
            ))) ||
            ('links' in props &&
              props.links.map((link) => (
                <MenuItem key={link.name} item={link} />
              )))}
        </ul>
      </div>
    </li>
  );
}

export default Menu;
