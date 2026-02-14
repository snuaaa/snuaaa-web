import { Link } from '@tanstack/react-router';

type View = 'posts' | 'photos' | 'comments';

type ButtonProps = {
  to: string;
  isSelected: boolean;
  text: string;
};

const LinkButton = ({ to, isSelected, text }: ButtonProps) => (
  <Link
    className={`mx-[15px] font-bold text-lg ${isSelected ? 'text-[#7193C4]' : 'text-[#CDD9EA]'}`}
    to={to}
  >
    <span className="enif-hide-mobile">등록한 </span>
    {text}
  </Link>
);

type Props = {
  selected: View;
  routes: {
    posts: string;
    photos: string;
    comments: string;
  };
};

const Tab = ({ selected, routes }: Props) => {
  return (
    <div className="flex md:justify-center my-4 md:my-[30px]">
      <LinkButton
        to={routes.posts}
        isSelected={selected === 'posts'}
        text="게시글"
      />
      <LinkButton
        to={routes.photos}
        isSelected={selected === 'photos'}
        text="사진"
      />
      <LinkButton
        to={routes.comments}
        isSelected={selected === 'comments'}
        text="댓글"
      />
    </div>
  );
};

export default Tab;
