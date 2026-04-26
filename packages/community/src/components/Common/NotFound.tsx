import { Link } from '@tanstack/react-router';

type Props = {
  message?: string;
};

const NotFound = ({ message = '존재하지 않는 페이지입니다.' }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 px-4 min-h-[60vh] text-center">
      <div className="bg-white/70 backdrop-blur-md rounded-3xl py-16 px-20 border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] flex flex-col items-center">
        <h1 className="text-[6rem] font-extrabold bg-linear-to-br from-[#4A90E2] to-[#50E3C2] bg-clip-text text-transparent mb-6 leading-none m-0">
          404
        </h1>
        <p className="text-xl text-[#666] mb-12 font-medium">{message}</p>
        <Link
          to="/"
          className="px-10 py-4 bg-linear-to-br from-[#4A90E2] to-[#50E3C2] text-white rounded-full no-underline font-semibold text-base transition-all duration-300 shadow-[0_4px_15px_rgba(74,144,226,0.3)] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(74,144,226,0.5)]"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
