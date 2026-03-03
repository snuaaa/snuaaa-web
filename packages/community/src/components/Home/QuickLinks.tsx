import icon_weather from '~/assets/img/common/icon_weather.png';
import icon_stella from '~/assets/img/common/icon_stella.png';
import icon_apod from '~/assets/img/common/icon_apod.png';

const links = [
  {
    href: 'https://m.kma.go.kr/m/index.jsp',
    img: icon_weather,
    alt: '기상청',
    label: '날씨',
  },
  {
    href: 'https://stellarium-web.org/',
    img: icon_stella,
    alt: 'Stellarium',
    label: '별지도',
  },
  {
    href: 'https://apod.nasa.gov/apod/',
    img: icon_apod,
    alt: 'APOD',
    label: 'APOD',
  },
];

function QuickLinks() {
  return (
    <div className="rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/10 p-4">
      <div className="flex justify-around items-center">
        {links.map((link) => (
          <a
            key={link.alt}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group"
          >
            <img
              src={link.img}
              alt={link.alt}
              className="w-11 h-11 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg"
            />
            <span className="text-[11px] text-white/50 group-hover:text-white/80 transition-colors">
              {link.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default QuickLinks;
