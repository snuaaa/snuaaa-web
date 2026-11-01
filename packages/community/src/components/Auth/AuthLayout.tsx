import type { ReactNode } from 'react';

import logo from '~/assets/img/logo_white.png';
import { cn } from '~/lib/utils';
import { BackButton } from '~/components/ui';

// x%, y%, size px, opacity
const STARS: [number, number, number, number][] = [
  [8, 5, 2, 0.8],
  [23, 11, 1, 0.5],
  [38, 4, 1.5, 0.7],
  [56, 8, 1, 0.4],
  [77, 5, 2, 0.9],
  [90, 13, 1, 0.5],
  [15, 20, 1, 0.4],
  [85, 24, 1.5, 0.6],
  [5, 31, 1, 0.3],
  [95, 36, 1, 0.4],
  [31, 27, 1, 0.3],
  [67, 19, 1, 0.5],
  [49, 13, 2.5, 0.9],
  [10, 45, 1, 0.3],
  [92, 50, 1, 0.3],
  [18, 66, 1, 0.25],
  [85, 71, 1.5, 0.3],
  [51, 85, 1, 0.25],
  [8, 92, 1, 0.3],
  [90, 90, 1, 0.3],
  [28, 78, 1, 0.2],
  [72, 82, 1, 0.25],
  [64, 2, 1, 0.6],
  [3, 14, 1.5, 0.5],
];

/** Scattered dots on the night-sky background. */
export function StarField({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      aria-hidden
    >
      {STARS.map(([x, y, size, opacity], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            opacity,
          }}
        />
      ))}
    </div>
  );
}

export function ClubLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-navy-800',
        className,
      )}
    >
      <img src={logo} alt="" className="size-3/4" />
    </span>
  );
}

type AuthLayoutProps = {
  /**
   * How the page looks on mobile: `night` keeps the sky (로그인, 가입 완료),
   * `plain` is a white form page (가입 단계).
   */
  mobile: 'night' | 'plain';
  children: ReactNode;
};

/**
 * Login and signup: the night sky with the club name on the left and a
 * white card on the right on desktop; full-screen pages on mobile.
 */
export default function AuthLayout({ mobile, children }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-dvh text-fg md:bg-navy-950',
        mobile === 'night' ? 'bg-navy-950' : 'bg-surface',
      )}
    >
      <StarField className={cn(mobile === 'plain' && 'hidden md:block')} />
      <div className="relative hidden flex-1 flex-col justify-between px-[72px] py-16 text-fg-on-brand md:flex">
        <div className="flex items-center gap-3">
          <ClubLogo className="size-11" />
          <span className="text-lg font-semibold">
            서울대학교 아마추어 천문회
          </span>
        </div>
        <div className="flex flex-col gap-3.5">
          <p className="text-[44px] leading-tight font-bold tracking-[-1px]">
            오늘 밤도
            <br />
            맑은 하늘을
          </p>
          <p className="text-base text-fg-on-brand-muted">
            관측, 사진, 이야기를 나누는 AAA 커뮤니티
          </p>
        </div>
        <span />
      </div>
      <div className="relative flex w-full flex-col md:w-[560px] md:shrink-0 md:items-center md:justify-center md:p-8">
        <div className="flex w-full flex-1 flex-col md:max-h-[calc(100dvh-4rem)] md:w-[460px] md:flex-none md:overflow-y-auto md:rounded-[20px] md:bg-surface md:px-8 md:pt-7 md:pb-6 md:shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

type StepHeaderProps = {
  step: number;
  total: number;
  onBack: () => void;
};

/** ‹ and 2 / 3 with the progress bar, above each signup step. */
export function StepHeader({ step, total, onBack }: StepHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5 pt-safe-2 pr-4 pb-3.5 pl-1 md:p-0 md:pb-4">
      <div className="flex items-center justify-between">
        <BackButton
          aria-label="이전"
          onClick={onBack}
          className="md:-ml-3 md:size-9"
        />
        <span className="text-caption font-semibold text-fg-muted">
          {step} / {total}
        </span>
      </div>
      <div className="flex gap-1.5 pl-3 md:pl-0" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full',
              i < step ? 'bg-primary' : 'bg-gray-200',
            )}
          />
        ))}
      </div>
    </div>
  );
}
