import { FC, PropsWithChildren } from 'react';
import { Equipment } from '~/services/types';
import Image from '~/components/Common/AaaImage';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import ManagementButton from './ManagementButton';
import RentButton from './RentButton';
import BasicInfo from './BasicInfo';

type Props = {
  equip: Equipment;
  type: 'rent' | 'admin';
};

const Title = ({ children }: PropsWithChildren) => {
  return (
    <h5 className="text-sm font-bold line-clamp-2 break-words">{children}</h5>
  );
};

const EquipmentItem: FC<Props> = ({ equip, type }) => {
  const viewportSize = useViewportSize();

  const isMobile = viewportSize === ViewportSize.Mobile;

  return (
    <div className="flex relative border-2 border-gray-300 md:flex-col px-3 py-2 gap-6 md:gap-1 items-center md:items-stretch">
      {!isMobile && <Title>{equip.name}</Title>}
      <div className="w-2/5 md:w-full flex justify-center">
        <Image imgSrc={equip.img_path} className="h-24" />
      </div>
      <div className="w-3/5 md:w-full">
        {isMobile && <Title>{equip.name}</Title>}
        <BasicInfo equipment={equip} />
        {type === 'admin' ? (
          <ManagementButton equipment={equip} />
        ) : (
          <RentButton equipment={equip} />
        )}
      </div>
    </div>
  );
};

export default EquipmentItem;
