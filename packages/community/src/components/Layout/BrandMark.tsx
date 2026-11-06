import { Link } from '@tanstack/react-router';
import logo from '~/assets/img/logo_white.png';

/** Club logo and name, linking home. Sits on the navy header. */
export default function BrandMark() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2.5 text-fg-on-brand"
      aria-label="서울대 아마추어 천문회 홈"
    >
      <img src={logo} alt="" className="size-8" />
      <span className="text-base font-semibold tracking-[-0.2px]">
        서울대 아마추어 천문회
      </span>
    </Link>
  );
}
