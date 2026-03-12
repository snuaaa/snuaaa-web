import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import Image from '../Common/AaaImage';
import { Exhibition } from '~/services/types';
import { useViewportSize, ViewportSize } from '~/contexts/viewportSize';

const NUM_UNIT_DESKTOP = 5;
const NUM_UNIT_MOBILE = 3;

type NewExhibitionsProps = {
  board_id: string;
  exhibitions: Exhibition[];
};

function NewExhibitions({ board_id, exhibitions }: NewExhibitionsProps) {
  const [page, setPage] = useState(0);
  const viewportSize = useViewportSize();
  const isMobile = viewportSize === ViewportSize.Mobile;

  const numUnits = isMobile ? NUM_UNIT_MOBILE : NUM_UNIT_DESKTOP;
  const startIndex = page * numUnits;

  const clickPrev = () => {
    if (page > 0) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const clickNext = () => {
    if (exhibitions && startIndex + numUnits < exhibitions.length) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const hasPrev = page > 0;
  const hasNext = exhibitions && startIndex + numUnits < exhibitions.length;

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
        {hasPrev && (
          <button
            onClick={clickPrev}
            className="flex absolute left-1 md:-left-5 z-10 w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-black/50 hover:bg-[#49A0AE] text-white hover:text-white backdrop-blur-md border border-white/20 transition-all duration-300 cursor-pointer shadow-lg"
          >
            <i className="ri-arrow-left-s-line text-lg md:text-xl"></i>
          </button>
        )}

        {/* Exhibition list */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 w-full">
          {exhibitions
            .slice(startIndex, startIndex + numUnits)
            .map((content) => {
              if (!content.exhibition) return null;

              return (
                <div key={content.content_id} className="group relative w-full">
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
        {hasNext && (
          <button
            onClick={clickNext}
            className="flex absolute right-1 md:-right-5 z-10 w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-black/50 hover:bg-[#49A0AE] text-white hover:text-white backdrop-blur-md border border-white/20 transition-all duration-300 cursor-pointer shadow-lg"
          >
            <i className="ri-arrow-right-s-line text-lg md:text-xl"></i>
          </button>
        )}
      </div>
    </div>
  );
}

export default NewExhibitions;
