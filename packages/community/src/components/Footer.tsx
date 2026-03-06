import logo from '~/assets/img/logo_white.png';

function Footer() {
  return (
    <footer
      id="aaa-bottom"
      className="bg-gradient-to-b from-[#0a1628] to-[#040c22] border-t border-white/[0.06]"
    >
      <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-12">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Logo + Name */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="SNUAAA" className="w-10 h-10 opacity-60" />
            <div>
              <p className="text-white/80 text-sm font-semibold tracking-tight">
                서울대학교 아마추어 천문회
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                Amateur Astronomy Association
              </p>
            </div>
          </div>

          {/* External links */}
          <div className="flex items-center gap-5">
            <a
              href="https://www.kma.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white/70 transition-colors text-xl"
              title="기상청"
            >
              <i className="ri-sun-cloudy-line"></i>
            </a>
            <a
              href="https://stellarium-web.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white/70 transition-colors text-xl"
              title="Stellarium"
            >
              <i className="ri-star-line"></i>
            </a>
            <a
              href="https://apod.nasa.gov/apod/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white/70 transition-colors text-xl"
              title="APOD"
            >
              <i className="ri-earth-line"></i>
            </a>
            <a
              href="https://archive.snuaaa.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white/70 transition-colors text-xl"
              title="AAArchive"
            >
              <i className="ri-archive-line"></i>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-white/30 text-xs">
          <p>ⓒ 2024 서울대학교 아마추어 천문회. Since 1980</p>
          <p>Designed by Soo · Programmed by Enif</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
