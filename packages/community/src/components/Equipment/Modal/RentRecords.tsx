import { useModal } from 'contexts/modal';
import { useFetch } from 'hooks/useFetch';
import { FC, useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import EquipmentService from 'services/EquipmentService';
import { PaymentStatus } from 'services/types';
import { convertFullDate } from 'utils/convertDate';

type Props = {
  id: number;
};

const PaymentStatusTextMap: Record<PaymentStatus, string> = {
  [PaymentStatus.RECEIVED_PAYMENT]: '지연 반납(연체료 완납)',
  [PaymentStatus.NEED_PAYMENT]: '지연 반납(연체료 미납)',
  [PaymentStatus.UNNECESSARY]: '정상 반납',
};

const PaymentStatusColorMap: Record<PaymentStatus, string> = {
  [PaymentStatus.RECEIVED_PAYMENT]: 'text-gray-600',
  [PaymentStatus.NEED_PAYMENT]: 'text-red-600',
  [PaymentStatus.UNNECESSARY]: 'text-green-600',
};

const RentRecords: FC<Props> = ({ id }) => {
  const { closeModal } = useModal();
  const [pageIdx, setPageIdx] = useState(1);
  const [photoRentId, setPhotoRentId] = useState<number | null>();

  const fetchFunction = useCallback(async () => {
    return EquipmentService.retrieveRentRecord(id, pageIdx);
  }, [id, pageIdx]);
  const { data, refresh } = useFetch({ fetch: fetchFunction });

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
    <div className="fixed z-30 top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center">
      <div className="absolute px-20 rounded-lg border border-gray-900 text-center bg-white z-40 py-5">
        <div>
          <button className="absolute top-0 right-0 m-2" onClick={closeModal}>
            <i className="ri-close-line text-3xl"></i>
          </button>
        </div>
        <h3 className="text-xl font-bold mt-4 mb-2">대여 기록</h3>
        <div className="my-8">
          <div className="flex items-center text-gray-950 border first:rounded-t-lg last:rounded-b-lg border-gray-300 w-full py-2">
            <div className="w-1/5">대여자</div>
            <div className="w-1/5">대여시각</div>
            <div className="w-1/5">반납기한</div>
            <div className="w-1/5">반납시각</div>
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
                <div className="w-1/5">
                  {convertFullDate(rentRecord.start_date)}
                </div>
                <div className="w-1/5">
                  {convertFullDate(rentRecord.end_date)}
                </div>
                <div className="w-1/5">
                  {rentRecord.rentReturn
                    ? convertFullDate(rentRecord.rentReturn.return_date)
                    : '-'}
                </div>
                <div
                  className={
                    'w-1/5 ' +
                    (rentRecord.rentReturn &&
                      PaymentStatusColorMap[
                        rentRecord.rentReturn.payment_status
                      ])
                  }
                >
                  {rentRecord.rentReturn
                    ? PaymentStatusTextMap[rentRecord.rentReturn.payment_status]
                    : '대여 중'}
                </div>
              </button>
              {rentRecord.rentReturn && photoRentId === rentRecord.id && (
                <div className="flex items-center text-gray-950 border first:rounded-t-lg last:rounded-b-lg border-gray-300 w-full py-2">
                  <button onClick={() => clickRecord(rentRecord.id)}>
                    <img
                      src={
                        // TODO: change to rentRecord.rentReturn.photo_path
                        /*rentRecord.rentReturn.photo_path*/ 'https://placehold.co/600x400'
                      }
                      alt="returned equip"
                    />
                  </button>
                </div>
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentRecords;
