import { Link } from '@tanstack/react-router';
import Menu from './Menu';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { ABOUT_AAA_LINKS, TOOLS_LINKS } from '../constants';

function Navigation() {
  const { noticeBoards, communityBoards, officialBoards, photoBoards } =
    useBoards();

  return (
    <nav
      className={
        'sticky top-0 h-8 md:h-[42px] bg-[#7092C4] md:bg-[#000E2C] w-full z-10 text-[0.8rem] md:text-base shadow-[0_1px_1px_0_rgba(105,105,105,0.61)] md:shadow-[0_2px_2px_0_rgba(50,45,119,0.61)]'
      }
    >
      <ul className="h-full w-full flex justify-around md:justify-center items-center">
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
