import type { ReactNode } from 'react';

/**
 * The legacy white content column (`sass/_section.scss`), for screens the
 * redesign has not moved yet.
 */
export default function LegacySection({ children }: { children: ReactNode }) {
  return (
    <div className="section-wrapper">
      <section>{children}</section>
    </div>
  );
}
