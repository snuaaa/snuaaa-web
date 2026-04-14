import { Link } from '@tanstack/react-router';
import Editor from '../Common/Editor';
import { SoundBoxResponse } from '~/services/HomeService';

const SoundBox = ({ soundBoxInfo }: { soundBoxInfo: SoundBoxResponse }) => {
  return (
    <div className="rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/10 overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <Link to="/board/$board_id" params={{ board_id: 'brd01' }}>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#49A0AE]/20 border border-[#49A0AE]/30 text-[#49A0AE] text-xs font-bold tracking-wider uppercase hover:bg-[#49A0AE]/30 transition-colors">
            <i className="ri-megaphone-line text-sm"></i>
            NOTICE
          </span>
        </Link>
      </div>
      <div className="relative flex-1 px-6 pb-6 overflow-hidden">
        <div className="max-h-[200px] overflow-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          {soundBoxInfo && (
            <>
              <Link
                to="/post/$post_id"
                params={{ post_id: String(soundBoxInfo.content_id) }}
                className="block"
              >
                <h5 className="text-lg font-bold text-white mb-3 hover:text-[#74B9FF] transition-colors">
                  {soundBoxInfo.title}
                </h5>
              </Link>
              <div className="text-white/70 text-sm leading-relaxed [&_.ck-content]:!bg-transparent [&_.ck-content]:text-white/70">
                <Editor
                  text={soundBoxInfo.text}
                  setText={() => {
                    return;
                  }}
                  readOnly
                />
              </div>
            </>
          )}
        </div>
        {/* Fade gradient at bottom */}
        <div className="absolute bottom-0 left-6 right-6 h-8 bg-gradient-to-t from-[#0a1a3a]/80 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default SoundBox;
