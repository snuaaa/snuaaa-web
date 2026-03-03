import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import Image from '../Common/AaaImage';
import { Exhibition } from '~/services/types';

const NUM_UNIT_DESKTOP = 5;
const NUM_UNIT_MOBILE = 3;

type NewExhibitionsProps = {
  board_id: string;
  exhibitions: Exhibition[];
};

function NewExhibitions({ board_id, exhibitions }: NewExhibitionsProps) {
  const [viewIdx, setViewIdx] = useState(0);

  const clickPrev = function () {
    if (exhibitions && viewIdx > 0) {
      setViewIdx(Math.max(0, viewIdx - NUM_UNIT_DESKTOP));
    }
  };

  const clickNext = function () {
    if (exhibitions && viewIdx < exhibitions.length - NUM_UNIT_DESKTOP) {
      setViewIdx(viewIdx + NUM_UNIT_DESKTOP);
    }
  };

  return (
    <div>
      <Link
        to="/board/$board_id"
        params={{ board_id }}
        className="flex items-center gap-2 mb-5 text-white font-extrabold text-lg tracking-tight no-underline"
      >
        <i className="ri-gallery-view-2 text-xl text-[#49A0AE]"></i>
        <span>역대 사진전</span>
        <div className="flex-1 h-0.5 ml-3 bg-gradient-to-r from-[#49A0AE] to-transparent rounded-full opacity-40"></div>
      </Link>

      <div className="relative flex items-center">
        {/* Left arrow */}
        <button
          onClick={clickPrev}
          className="hidden md:flex absolute -left-5 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-[#49A0AE] text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-all duration-300 cursor-pointer"
        >
          <i className="ri-arrow-left-s-line text-xl"></i>
        </button>

        {/* Exhibition list */}
        <div className="flex gap-3 md:gap-4 w-full overflow-x-auto md:overflow-hidden pb-2 md:pb-0 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {exhibitions.map((content, idx) => {
            // On desktop, show only items in the current range
            const isVisibleDesktop =
              idx >= viewIdx && idx < viewIdx + NUM_UNIT_DESKTOP;

            if (!content.exhibition) return null;

            return (
              <div
                key={content.content_id}
                className={`group shrink-0 w-[120px] md:w-auto md:flex-1 ${
                  isVisibleDesktop ? 'md:block' : 'md:hidden'
                }`}
              >
                <Link
                  to="/exhibition/$exhibition_id"
                  params={{ exhibition_id: String(content.content_id) }}
                  className="block"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <Image
                      imgSrc={content.exhibition.poster_thumbnail_path}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={clickNext}
          className="hidden md:flex absolute -right-5 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-[#49A0AE] text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-all duration-300 cursor-pointer"
        >
          <i className="ri-arrow-right-s-line text-xl"></i>
        </button>
      </div>
    </div>
  );
}

export default NewExhibitions;
