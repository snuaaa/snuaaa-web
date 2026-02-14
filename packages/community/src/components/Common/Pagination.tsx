import { Link, useNavigate } from '@tanstack/react-router';

type Props = {
  /**
   * 현재 페이지 인덱스
   */
  currentPage: number;
  /**
   * 총 페이지 수
   */
  totalPageCount: number;
  /**
   * page route 생성 함수
   */
  routeGenerator: (page: number) => string;
};

// ... (range, UsePaginationProps, MAX_BUTTONS, ELLIPSIS, usePagination logic remains same)
// 유틸리티: start부터 end까지의 숫자 배열 생성 (lodash _.range와 유사)
const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
}

const MAX_BUTTONS = 9; // 화면에 표시할 최대 버튼 수
const ELLIPSIS = '...' as const; // 생략 표시

// 로직을 담당하는 Custom Hook
const usePagination = ({ currentPage, totalPages }: UsePaginationProps) => {
  // 1. 전체 페이지가 MAX_BUTTONS 이하라면 그대로 반환
  if (totalPages <= MAX_BUTTONS) {
    return range(1, totalPages);
  }

  // 2. Ellipsis 표시 기준점 계산
  const shouldShowLeftDots = currentPage > MAX_BUTTONS / 2 + 1;
  const shouldShowRightDots = currentPage < totalPages - MAX_BUTTONS / 2 - 1;

  // Case A: 오른쪽에만 ...이 있는 경우 (초반 페이지)
  // [1, 2, 3, 4, 5, 6, 7, 8, '...', 100]
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const slideCount = MAX_BUTTONS - 2; // '...'과 '마지막페이지' 제외한 개수
    return [...range(1, slideCount), ELLIPSIS, totalPages];
  }

  // Case B: 왼쪽에만 ...이 있는 경우 (후반 페이지)
  // [1, '...', 93, 94, 95, 96, 97, 98, 99, 100]
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const slideCount = MAX_BUTTONS - 2; // '1'과 '...' 제외한 개수
    return [1, ELLIPSIS, ...range(totalPages - slideCount + 1, totalPages)];
  }

  // Case C: 양쪽에 ...이 있는 경우 (중간 페이지)
  // [1, '...', 48, 49, 50, 51, 52, '...', 100]
  // 대칭을 위해 중앙 5개(current -2 ~ +2)를 보여줌 (총 9개 버튼이 됨)
  return [
    1,
    ELLIPSIS,
    ...range(currentPage - 2, currentPage + 2),
    ELLIPSIS,
    totalPages,
  ];
};

const Pagination = ({ currentPage, totalPageCount, routeGenerator }: Props) => {
  const pages = usePagination({ currentPage, totalPages: totalPageCount });
  const navigate = useNavigate();
  const buttonClassName = 'w-6 h-6 flex justify-center items-center font-bold ';

  return (
    <ul className="flex w-full justify-center items-center py-2 gap-2">
      <li>
        <button
          onClick={() => {
            navigate({ to: routeGenerator(currentPage - 1) });
          }}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="disabled:text-gray-500"
        >
          <i className="ri-arrow-left-s-line text-2xl cursor-pointer"></i>
        </button>
      </li>
      {pages.map((page, index) => (
        <li key={index}>
          {page === ELLIPSIS ? (
            <i className="ri-more-line text-xl text-gray-500"></i>
          ) : (
            <Link
              className={`${buttonClassName} ${page === currentPage ? 'text-white bg-[#7193C4] rounded-full' : ''}`}
              to={routeGenerator(page as number)}
            >
              {page}
            </Link>
          )}
        </li>
      ))}
      <li>
        <button
          onClick={() => {
            navigate({ to: routeGenerator(currentPage + 1) });
          }}
          disabled={currentPage === totalPageCount}
          aria-label="Next page"
          className="disabled:text-gray-500"
        >
          <i className="ri-arrow-right-s-line text-2xl cursor-pointer"></i>
        </button>
      </li>
    </ul>
  );
};

export default Pagination;
