import React from 'react';
import { Equipment } from 'services/types';
import Image from '../../components/Common/AaaImage';

const ShoppingItem: React.FC<{ equipment: Equipment; cancel: () => void }> = ({
  equipment,
  cancel,
}) => {
  return (
    <div className="relative flex flex-col items-center border rounded-lg p-2 shadow-md w-40 overflow-visible">
      {/* 삭제 버튼 */}
      <button
        className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition z-10"
        onClick={cancel}
      >
        ✕
      </button>
      <Image imgSrc={equipment.img_path} className="relative z-0" />
      <p className="text-center mt-2 text-sm font-medium">{equipment.name}</p>
    </div>
  );
};

export default ShoppingItem;
