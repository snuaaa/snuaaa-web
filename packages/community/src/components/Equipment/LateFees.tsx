import { FC, useState, useCallback } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BoardName from '~/components/Board/BoardName';
import Paginator from '~/components/Common/Paginator';
import Loading from '~/components/Common/Loading';
import { useAuth } from '~/contexts/auth';
import { withModal } from '~/contexts/modal';
import {
  useAllRentRecords,
  useUpdatePenaltyStatus,
  AllRentRecordFilters,
} from '~/hooks/queries/useEquipmentQueries';
import { PenaltyStatus, RentWithEquipment } from '~/services/types';
import { convertFullDate } from '~/utils/convertDate';

const EQUIP_ADMIN_GRADE = 6;
const ROWNUM = 10;

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

const PenaltyStatusFilterOptions: { value: PenaltyStatus | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: PenaltyStatus.NEED_PAYMENT, label: '연체료 미납' },
  { value: PenaltyStatus.RECEIVED_PAYMENT, label: '연체료 완납' },
  { value: PenaltyStatus.NO_PENALTY, label: '정상 반납' },
];

const toDateString = (date: Date | null): string | undefined => {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDate = (str?: string): Date | null => {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const LateFees: FC = () => {
  const authContext = useAuth();
  const search = useSearch({ from: '/equipment/admin/fees' });
  const navigate = useNavigate({ from: '/equipment/admin/fees' });

  const [photoRentId, setPhotoRentId] = useState<number | null>(null);

  const pageIdx = search.page || 1;
  const filters: AllRentRecordFilters = {
    penaltyStatus: search.penalty_status || '',
    dateFromStart: search.date_from_start,
    dateToStart: search.date_to_start,
    dateFromReturn: search.date_from_return,
    dateToReturn: search.date_to_return,
  };

  const { data, isLoading } = useAllRentRecords(filters, pageIdx);
  const updatePenalty = useUpdatePenaltyStatus();

  const handleSearchChange = useCallback(
    (updater: Partial<typeof search>) => {
      navigate({
        search: (prev) => ({ ...prev, ...updater, page: updater.page ?? 1 }),
        replace: true,
      });
    },
    [navigate],
  );

  const handleClickPage = (page: number) => {
    handleSearchChange({ page });
  };

  const handleClickRecord = (id: number) => {
    setPhotoRentId(photoRentId === id ? null : id);
  };

  const handleTogglePenalty = (rentId: number, current: PenaltyStatus) => {
    const next =
      current === PenaltyStatus.NEED_PAYMENT
        ? PenaltyStatus.RECEIVED_PAYMENT
        : PenaltyStatus.NEED_PAYMENT;
    const msg =
      current === PenaltyStatus.NEED_PAYMENT
        ? '연체료 완납 처리하시겠습니까?'
        : '연체료 미납 상태로 되돌리시겠습니까?';
    if (!window.confirm(msg)) return;
    updatePenalty.mutate({ rentId, penaltyStatus: next });
  };

  if (authContext.authInfo.user.grade > EQUIP_ADMIN_GRADE) {
    return (
      <div className="board-wrapper">
        <BoardName board_id={undefined} board_name={'연체료 관리'} />
        <p className="text-center mt-10 text-gray-500">권한이 없습니다.</p>
      </div>
    );
  }

  const rentCount = data?.count ?? 0;
  const rentRecords: RentWithEquipment[] = data?.rows ?? [];

  return (
    <div className="board-wrapper">
      <BoardName board_id={undefined} board_name={'연체료 관리'} />
      <div className="mb-4">
        <Link to="/equipment/admin" className="text-gray-600 text-sm">
          &lt;&lt; 장비 관리로 돌아가기
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">상태</label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={search.penalty_status || ''}
            onChange={(e) =>
              handleSearchChange({
                penalty_status: (e.target.value as PenaltyStatus) || undefined,
              })
            }
          >
            {PenaltyStatusFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">대여 시작일</label>
          <div className="flex items-center gap-1">
            <DatePicker
              selected={parseDate(search.date_from_start)}
              onChange={(date) =>
                handleSearchChange({ date_from_start: toDateString(date) })
              }
              dateFormat="yyyy/MM/dd"
              placeholderText="시작"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
              isClearable
            />
            <span className="text-gray-400">~</span>
            <DatePicker
              selected={parseDate(search.date_to_start)}
              onChange={(date) =>
                handleSearchChange({ date_to_start: toDateString(date) })
              }
              dateFormat="yyyy/MM/dd"
              placeholderText="끝"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
              isClearable
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">반납일</label>
          <div className="flex items-center gap-1">
            <DatePicker
              selected={parseDate(search.date_from_return)}
              onChange={(date) =>
                handleSearchChange({ date_from_return: toDateString(date) })
              }
              dateFormat="yyyy/MM/dd"
              placeholderText="시작"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
              isClearable
            />
            <span className="text-gray-400">~</span>
            <DatePicker
              selected={parseDate(search.date_to_return)}
              onChange={(date) =>
                handleSearchChange({ date_to_return: toDateString(date) })
              }
              dateFormat="yyyy/MM/dd"
              placeholderText="끝"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
              isClearable
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="flex items-center text-gray-950 font-bold border border-gray-300 rounded-t-lg w-full py-2 text-sm">
              <div className="w-[14%] text-center">장비명</div>
              <div className="w-[12%] text-center">대여자</div>
              <div className="w-[16%] text-center">대여 시각</div>
              <div className="w-[16%] text-center">반납 기한</div>
              <div className="w-[16%] text-center">반납 시각</div>
              <div className="w-[14%] text-center">상태</div>
              <div className="w-[12%] text-center">조치</div>
            </div>
            {rentRecords.length === 0 && (
              <div className="flex items-center justify-center border border-gray-300 w-full py-6 text-gray-400 text-sm">
                조회된 기록이 없습니다.
              </div>
            )}
            {rentRecords.map((record) => (
              <div key={record.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleClickRecord(record.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleClickRecord(record.id)}
                  className="flex items-center text-gray-950 border border-t-0 border-gray-300 w-full py-2 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-[14%] text-center truncate px-1">
                    {record.equipment.name}
                  </div>
                  <div className="w-[12%] text-center truncate px-1">
                    {record.user.nickname}
                  </div>
                  <div className="w-[16%] text-center break-words text-xs">
                    {convertFullDate(record.start_date)}
                  </div>
                  <div className="w-[16%] text-center break-words text-xs">
                    {convertFullDate(record.end_date)}
                  </div>
                  <div className="w-[16%] text-center break-words text-xs">
                    {record.rentReturn
                      ? convertFullDate(record.rentReturn.return_date)
                      : '-'}
                  </div>
                  <div
                    className={
                      'w-[14%] text-center text-xs ' +
                      (record.rentReturn
                        ? PenaltyStatusColorMap[record.rentReturn.penalty_status]
                        : '')
                    }
                  >
                    {record.rentReturn
                      ? PenaltyStatusTextMap[record.rentReturn.penalty_status]
                      : '대여 중'}
                  </div>
                  <div
                    className="w-[12%] text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {record.rentReturn?.penalty_status ===
                      PenaltyStatus.NEED_PAYMENT && (
                      <button
                        className="bg-[#49A1AF] text-white text-xs px-2 py-1 rounded hover:bg-[#3d8a96]"
                        onClick={() =>
                          handleTogglePenalty(record.id, PenaltyStatus.NEED_PAYMENT)
                        }
                        disabled={updatePenalty.isPending}
                      >
                        완납 처리
                      </button>
                    )}
                    {record.rentReturn?.penalty_status ===
                      PenaltyStatus.RECEIVED_PAYMENT && (
                      <button
                        className="bg-gray-400 text-white text-xs px-2 py-1 rounded hover:bg-gray-500"
                        onClick={() =>
                          handleTogglePenalty(record.id, PenaltyStatus.RECEIVED_PAYMENT)
                        }
                        disabled={updatePenalty.isPending}
                      >
                        미납 처리
                      </button>
                    )}
                  </div>
                  </div>
                {record.rentReturn && photoRentId === record.id && (
                  <div className="flex items-center border border-t-0 border-gray-300 w-full py-2">
                    <button
                      onClick={() => handleClickRecord(record.id)}
                      className="mx-auto"
                    >
                      <img
                        src={record.rentReturn.photo_path}
                        alt="returned equip"
                        className="max-w-full max-h-72 object-contain"
                      />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {rentCount > 0 && (
        <Paginator
          pageIdx={pageIdx}
          pageNum={Math.max(1, Math.ceil(rentCount / ROWNUM))}
          clickPage={handleClickPage}
        />
      )}
    </div>
  );
};

export default withModal(LateFees);
