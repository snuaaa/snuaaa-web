import { Link } from '@tanstack/react-router';
import Menu from './Menu';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { ABOUT_AAA_LINKS, TOOLS_LINKS } from '../constants';

function Navigation() {
  const { noticeBoards, communityBoards, officialBoards, photoBoards } =
    useBoards();

  return (
    <nav className="w-full bg-[#040c22]/80 backdrop-blur-md border-t border-white/[0.06] sticky top-0 z-10">
      <ul className="max-w-[1200px] mx-auto h-[42px] flex justify-center items-center gap-1">
        <Menu menuName={<Link to="/">★</Link>} />
        <Menu menuName="A.A.A." menuItems={ABOUT_AAA_LINKS} />
        <Menu menuName="Notice" menuItems={noticeBoards} />
        <Menu menuName="Daily" menuItems={communityBoards} />
        <Menu menuName="Docu" menuItems={officialBoards} />
        <Menu menuName="Photo" menuItems={photoBoards} />
        <Menu menuName="Tools" menuItems={TOOLS_LINKS} />
      </ul>
    </nav>
  );
}

export default Navigation;
