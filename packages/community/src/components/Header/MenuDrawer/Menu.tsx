import { Board } from '~/services/types';
import { MenuLink } from '../Navigation/types';
import { useAuth } from '~/contexts/auth';
import MenuItem from './MenuItem';
import { ChangeEvent, ReactElement, useCallback, useState } from 'react';

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

  const [isOpen, setIsOpen] = useState(false);
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);

  const handleChangeChecked = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsOpen(isChecked);
    if (isChecked) {
      setIsSubMenuVisible(true);
    }
  };

  const subMenuRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        node.style.maxHeight = isOpen ? `${node.scrollHeight}px` : '0';
      }
    },
    [isOpen],
  );

  const handleTransitionEnd = () => {
    if (!isOpen) {
      setIsSubMenuVisible(false);
    }
  };

  return (
    <li className="px-2 bg-slate-700">
      <input
        type="checkbox"
        id={menuName}
        className="hidden peer"
        onChange={handleChangeChecked}
        checked={isOpen}
      />
      <label
        htmlFor={menuName}
        className="cursor-pointer font-extrabold flex items-center gap-2"
      >
        {icon}
        {menuName}
      </label>
      <div
        ref={subMenuRef}
        className="text-sm max-h-0 overflow-hidden transition-[max-height] duration-200 ease-in"
        onTransitionEnd={() => {
          handleTransitionEnd();
        }}
      >
        <ul
          className={`flex flex-col gap-3 pt-4 ${isSubMenuVisible ? 'visible' : 'invisible'}`}
        >
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
