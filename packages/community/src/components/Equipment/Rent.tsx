import { FC, useState } from 'react';
import BoardName from '../Board/BoardName';
import { useAuth } from 'contexts/auth';
import EquipList from './EquipList';
import { ShoppingProvider } from 'contexts/ShoppingContext';
import ShoppingCartComponent from './ShoppingCartComponent';

const Rent: FC = () => {
  return (
    <div className="board-wrapper flex flex-col gap-4 p-4">
      <BoardName board_id={undefined} board_name={'장비 대여'} />
      <ShoppingProvider>
        <div className="flex gap-6">
          {/* 쇼핑 아이템 리스트 (왼쪽) */}
          <div className="flex-[3] min-w-0">
            <EquipList isAdmin={false} />
          </div>

          {/* 장바구니 (오른쪽, 스크롤 따라오기) */}
          <div className="flex-[1] w-72 h-fit sticky top-4">
            <ShoppingCartComponent />
          </div>
        </div>
      </ShoppingProvider>
    </div>
  );
};

export default Rent;
