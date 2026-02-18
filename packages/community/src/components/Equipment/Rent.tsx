import { FC, useCallback } from 'react';
import EquipSearchBar from './EquipSearchBar';
import EquipList from './EquipList';
import Loading from '~/components/Common/Loading';
import { withModal } from '~/contexts/modal';
import BoardName from '~/components/Board/BoardName';
import EquipCart from './EquipCart';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useEquipment, withEquipment } from './contexts';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { EquipSearchLocationState } from './common';

const Rent: FC = () => {
  const { data } = useEquipment();
  const viewportSize = useViewportSize();

  const search = useSearch({ from: '/equipment/rent' });
  const navigate = useNavigate({ from: '/equipment/rent' });

  const handleSearchChange = useCallback(
    (updater: (prev: EquipSearchLocationState) => EquipSearchLocationState) => {
      navigate({
        search: updater,
        replace: true,
      });
    },
    [navigate],
  );

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="board-wrapper">
      <BoardName board_name={'장비 대여'} />
      <Link
        className="text-gray-400 text-md font-bold mb-4 w-fit"
        to="/equipment"
      >
        &lt; BACK
      </Link>
      <div className="w-full">
        {viewportSize !== ViewportSize.Mobile ? (
          <>
            <EquipSearchBar
              search={search}
              onSearchChange={handleSearchChange}
            />
            <div className="flex">
              <div className="w-2/3">
                <EquipList
                  data={data}
                  columns={2}
                  type="rent"
                  search={search}
                />
              </div>
              <div className="w-1/3 sticky top-20 h-fit">
                <EquipCart columns={2} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-full">
              <EquipSearchBar
                search={search}
                onSearchChange={handleSearchChange}
              />
              <EquipList data={data} columns={1} type="rent" search={search} />
            </div>
            <div className="h-[15dvh]"></div>
            <div className="fixed z-2 bottom-0 left-0 w-full overflow-y-auto h-1/4 bg-white rounded-t-3xl shadow-[0_0_20px_rgba(0,0,0,0.25)] pt-4">
              <EquipCart columns={4} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default withModal(withEquipment(Rent));
