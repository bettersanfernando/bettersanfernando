'use client';

import { useEffect, useState } from 'react';

interface HomeCivicMetricsProps {
  population: number;
  barangays: number;
  projects: number;
  services: number;
}

const numberFormatter = new Intl.NumberFormat('en-PH');

export default function HomeCivicMetrics({
  population,
  barangays,
  projects,
  services,
}: HomeCivicMetricsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    population: 0,
    barangays: 0,
    projects: 0,
    services: 0,
  });

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      const frameId = requestAnimationFrame(() => {
        setAnimatedValues({
          population,
          barangays,
          projects,
          services,
        });
      });
      return () => cancelAnimationFrame(frameId);
    }

    const duration = 850; // ms (within target 700-1000ms)
    const startTime = performance.now();

    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out: smooth deceleration without overshoot or bounce
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        population: Math.round(population * ease),
        barangays: Math.round(barangays * ease),
        projects: Math.round(projects * ease),
        services: Math.round(services * ease),
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [population, barangays, projects, services]);

  const metrics = [
    {
      finalFormatted: numberFormatter.format(population),
      currentFormatted: numberFormatter.format(animatedValues.population),
      label: 'Population',
      qualifier: '2024 POPCEN',
    },
    {
      finalFormatted: numberFormatter.format(barangays),
      currentFormatted: numberFormatter.format(animatedValues.barangays),
      label: 'Barangays',
      qualifier: 'PUBLISHED SET',
    },
    {
      finalFormatted: numberFormatter.format(projects),
      currentFormatted: numberFormatter.format(animatedValues.projects),
      label: 'Published Project Records',
      qualifier: 'PUBLISHED RECORDS',
    },
    {
      finalFormatted: numberFormatter.format(services),
      currentFormatted: numberFormatter.format(animatedValues.services),
      label: 'Resident-Facing Services',
      qualifier: 'RESIDENT-FACING',
    },
  ];

  return (
    <div className="mx-auto mt-8 sm:mt-9 xl:mt-11 2xl:mt-13 max-w-4xl xl:max-w-5xl 2xl:max-w-6xl border-t border-white/15 pt-6 sm:pt-7 xl:pt-8 2xl:pt-9">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-x-0 sm:gap-y-0 sm:divide-x sm:divide-white/15">
        {metrics.map(metric => (
          <div key={metric.label} className="px-3 sm:px-4 xl:px-6 text-center">
            <dd className="text-2xl sm:text-3xl lg:text-[38px] xl:text-[44px] 2xl:text-[50px] font-extrabold tabular-nums tracking-tight text-white leading-none">
              <span className="sr-only">{metric.finalFormatted}</span>
              <span aria-hidden="true">{metric.currentFormatted}</span>
            </dd>
            <dt className="mt-1.5 xl:mt-2 text-xs sm:text-sm xl:text-base font-semibold text-white/90 text-balance">
              {metric.label}
            </dt>
            <p className="mt-0.5 xl:mt-1 font-mono text-[10px] xl:text-[11px] 2xl:text-xs uppercase tracking-wider text-blue-200/75">
              {metric.qualifier}
            </p>
          </div>
        ))}
      </dl>
    </div>
  );
}
