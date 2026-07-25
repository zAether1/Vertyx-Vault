import type { SpotlightData } from '@/types/content';
import { CirclePlayIcon, StarLucideIcon } from '@/components/icons';

/** Banner destacado ancho del template (El día de la revelación / La casa del dragón). */
export default function SpotlightBanner({ data }: { data: SpotlightData }) {
  return (
    <div className="px-4 md:px-8">
      <div className="relative w-full h-[280px] sm:h-[320px] md:h-[420px] bg-black/30 rounded-xl overflow-hidden border border-[#b9a9ca]/12 shadow-lg shadow-[#08070d]/24 mb-8 mt-2">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={data.title}
            className="object-cover"
            src={data.bg}
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              inset: 0,
              color: 'transparent',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-transparent to-black/95"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50"></div>
          <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-gradient-to-r from-[#120b1c]/30 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-gradient-to-l from-[#120b1c]/30 to-transparent"></div>
        </div>
        <div className="relative h-full flex flex-col md:flex-row items-center md:gap-12 px-5 md:px-10 py-6 md:py-0">
          <div className="hidden md:block flex-shrink-0 w-[200px] h-[300px] relative rounded-lg overflow-hidden shadow-xl shadow-[#120b1c]/40 border border-[#120b1c]/30 transform hover:scale-105 transition-all duration-300">
            <div className="absolute -inset-1 bg-[#120b1c]/20 blur-md rounded-xl"></div>
            <div className="relative rounded-lg overflow-hidden h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={data.title}
                className="object-cover"
                src={data.poster}
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: 0,
                  color: 'transparent',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40"></div>
              <div className="absolute top-3 left-3 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm border border-[#120b1c]/40">
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="#8f5bd7"
                      strokeWidth="1.2"
                      strokeDasharray={`${data.ratingDash}, 100`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                  <span className="text-[#eee9f4] text-xs font-medium">{data.rating}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 max-w-3xl space-y-3 md:space-y-4 md:ml-3 pt-2">
            <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-[#eee9f4] tracking-wide drop-shadow-md">
              {data.title}
            </h2>
            <div className="flex items-center gap-3 text-xs md:text-sm">
              <span className="bg-[#5f318f] text-[#eee9f4] text-xs px-3 py-0.5 rounded-md font-medium">
                {data.type}
              </span>
              <div className="flex items-center gap-1 text-[#c9a8f0]">
                <StarLucideIcon className="lucide lucide-star w-3 h-3" />
                <span>{data.rating}</span>
              </div>
              <span className="text-[#eee9f4]/70">{data.year}</span>
            </div>
            <p className="text-[#eee9f4]/80 text-sm md:text-base line-clamp-2 md:line-clamp-3 max-w-2xl leading-relaxed">
              {data.desc}
            </p>
            <div className="flex items-center gap-3 md:gap-4 pt-3 md:pt-4">
              <a
                href={data.watchHref}
                className="flex items-center gap-2 bg-[#5f318f] text-[#eee9f4] px-4 md:px-6 py-2 rounded-md hover:bg-[#4b2774] transition-all duration-200 text-sm md:text-base font-medium"
              >
                <CirclePlayIcon className="lucide lucide-circle-play w-4 h-4 md:w-5 md:h-5" />
                Ver ahora
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
