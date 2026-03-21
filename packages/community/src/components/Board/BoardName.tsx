import { Link } from '@tanstack/react-router';

type BoardNameProps = {
  board_id: string;
  board_name: string;
};

const getCustomClassName = (board_id: string) => {
  switch (board_id) {
    case 'brd31':
      return 'memory-title';
    case 'brd32':
      return 'astrophoto-title';
    default:
      return '';
  }
};

function BoardName({ board_id, board_name }: BoardNameProps) {
  return (
    <Link
      to="/board/$board_id"
      params={{ board_id }}
      className="inline-block hover:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-3 py-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-aqua-400 shadow-[0_0_15px_rgba(73,160,174,0.3)] border border-white/20">
          <i className="ri-planet-line text-lg font-bold"></i>
        </div>
        <h2
          className={`text-2xl md:text-3xl font-extrabold tracking-tight ${getCustomClassName(board_id)}`}
        >
          {board_name}
        </h2>
      </div>
    </Link>
  );
}

export default BoardName;
