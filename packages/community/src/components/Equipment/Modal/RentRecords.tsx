import Paginator from '~/components/Common/Paginator';
import { useModal } from '~/contexts/modal';
import { FC, useState } from 'react';
import { PenaltyStatus } from '~/services/types';
import { convertFullDate } from '~/utils/convertDate';
import { useRentRecord } from '~/hooks/queries/useEquipmentQueries';

type Props = {
  id: number;
};

const RENTROWNUM = 10;

const PenaltyStatusTextMap: Record<PenaltyStatus, string> = {
  [PenaltyStatus.RECEIVED_PAYMENT]: '지연 반납(연체료 완납)',
  [PenaltyStatus.NEED_PAYMENT]: '지연 반납(연체료 미납)',
  [PenaltyStatus.NO_PENALTY]: '정상 반납',
};

const PenaltyStatusColorMap: Record<PenaltyStatus, string> = {
  [PenaltyStatus.RECEIVED_PAYMENT]: 'text-gray-600',
  [PenaltyStatus.NEED_PAYMENT]: 'text-red-600',
  [PenaltyStatus.NO_PENALTY]: 'text-green-600',
};

const RentRecords: FC<Props> = ({ id }) => {
  const { closeModal } = useModal();
  const [pageIdx, setPageIdx] = useState(1);
  const [photoRentId, setPhotoRentId] = useState<number | null>();

  const { data } = useRentRecord(id, pageIdx);

  const rentCount = data?.count ?? 0;
  const rentRecords = data?.rows ?? [];

  const clickPage = (idx: number) => {
    setPageIdx(idx);
  };

  const clickRecord = (id: number) => {
    if (photoRentId === id) setPhotoRentId(null);
    else setPhotoRentId(id);
  };

  return (
    <div className="relative px-10 rounded-lg text-center bg-white z-40 py-5">
      <div>
        <button className="absolute top-0 right-0 m-2" onClick={closeModal}>
          <i className="ri-close-line text-3xl"></i>
        </button>
      </div>
      <h3 className="text-xl font-bold mt-4 mb-2">대여 기록</h3>
      <div className="mt-8">
        <div className="flex items-center text-gray-950 border first:rounded-t-lg last:rounded-b-lg border-gray-300 w-full py-2">
          <div className="w-1/5">대여자</div>
          <div className="w-1/5">대여 시각</div>
          <div className="w-1/5">반납 기한</div>
          <div className="w-1/5">반납 시각</div>
          <div className="w-1/5">
            상태
            {/*대여 중, 정상 반납, 지연 반납(연체료 미납), 지연 반납(연체료 완납)*/}
          </div>
        </div>
        {rentRecords.map((rentRecord) => (
          <>
            <button
              onClick={() => clickRecord(rentRecord.id)}
              className="flex items-center text-gray-950 border first:rounded-t-lg last:rounded-b-lg border-gray-300 w-full py-2"
              key={rentRecord.id}
            >
              <div className="w-1/5">{rentRecord.user.nickname}</div>
              <div className="w-1/5 break-words">
                {convertFullDate(rentRecord.start_date)}
              </div>
              <div className="w-1/5 break-words">
                {convertFullDate(rentRecord.end_date)}
              </div>
              <div className="w-1/5 break-words">
                {rentRecord.rentReturn
                  ? convertFullDate(rentRecord.rentReturn.return_date)
                  : '-'}
              </div>
              <div
                className={
                  'w-1/5 ' +
                  (rentRecord.rentReturn &&
                    PenaltyStatusColorMap[rentRecord.rentReturn.penalty_status])
                }
              >
                {rentRecord.rentReturn
                  ? PenaltyStatusTextMap[rentRecord.rentReturn.penalty_status]
                  : '대여 중'}
              </div>
            </button>
            {rentRecord.rentReturn && photoRentId === rentRecord.id && (
              <div className="flex items-center text-gray-950 border first:rounded-t-lg last:rounded-b-lg border-gray-300 w-full py-2">
                <button
                  onClick={() => clickRecord(rentRecord.id)}
                  className="mx-auto"
                >
                  <img
                    src={rentRecord.rentReturn.photo_path}
                    alt="returned equip"
                    className="max-w-full max-h-72 object-contain"
                  />
                </button>
              </div>
            )}
          </>
        ))}
      </div>
      <div>
        <Paginator
          pageIdx={pageIdx}
          pageNum={Math.ceil(rentCount / RENTROWNUM)}
          clickPage={clickPage}
        />
      </div>
    </div>
  );
};

export default RentRecords;
