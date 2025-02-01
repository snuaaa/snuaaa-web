import { FC, useState } from 'react';
import BoardName from '../Board/BoardName';
import { useAuth } from 'contexts/auth';
import EquipList from './EquipList';
import { ShoppingProvider } from 'contexts/ShoppingContext';
import ShoppingCartComponent from './ShoppingCartComponent';

const Rent: FC = () => {
  return (
    <div className="board-wrapper">
      <BoardName board_id={undefined} board_name={'장비 대여'} />
      <ShoppingProvider>
        <EquipList isAdmin={false} />
        <ShoppingCartComponent />
      </ShoppingProvider>
    </div>
  );
};

export default Rent;
