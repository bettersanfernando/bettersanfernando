import {
  ArrowUpRight,
  Facebook,
  Github,
  Heart,
  Linkedin,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { footerNavigation } from '../../data/navigation';

const externalLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

const socialLinks: readonly {
  label: string;
  href?: string;
  icon: LucideIcon;
}[] = [
  { label: 'Facebook', icon: Facebook },
  { label: 'LinkedIn', icon: Linkedin },
  {
    label: 'GitHub',
    href: 'https://github.com/bettersanfernando/bettersanfernando',
    icon: Github,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0B1730] text-white">
      <div className="container mx-auto px-4">
        <section className="relative z-10 -mt-16 mb-14 rounded-lg bg-[#0066EB] p-6 sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
            aria-hidden="true"
          >
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/15" />
            <div className="absolute -bottom-24 left-1/3 h-44 w-44 rounded-full border border-white/10" />
            <div className="absolute -bottom-16 left-1/4 h-32 w-64 rounded-t-full border-t border-white/10" />
            <div className="absolute right-1/3 top-8 h-10 w-24 border-r border-t border-white/10" />
            <div className="absolute right-12 top-12 grid grid-cols-4 gap-2 opacity-30">
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index} className="h-1 w-1 rounded-full bg-white" />
              ))}
            </div>
          </div>
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-eyebrow text-blue-100">
                Help Keep the Data Useful
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                Found something that needs another look?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                BetterSanFernando organizes public information from official
                sources. If you find an outdated record, incorrect detail,
                missing source, or broken link, send it to us for review.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch lg:justify-center">
              <a
                href="https://github.com/bettersanfernando/bettersanfernando/issues/new"
                {...externalLinkProps}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-white px-4 text-sm font-semibold text-[#0052BC] transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0066EB]"
              >
                <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                Report a data issue
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://github.com/bettersanfernando/bettersanfernando"
                {...externalLinkProps}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-white/70 bg-[#0052BC] px-4 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-[#00449d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                Contribute on GitHub
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <div className="pb-10 lg:pb-14">
          <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-12">
            <div>
              <img
                src="/assets/brand/logos/horizontal/better-san-fernando-horizontal-white-transparent-cropped.png"
                alt="BetterSanFernando"
                className="h-auto w-[230px] max-w-full"
              />
              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
                BetterSanFernando makes public information about the City of San
                Fernando easier to find, understand, and verify. Independent and
                community-run, it is{' '}
                <span className="font-medium text-slate-200">
                  not an official City Government website.
                </span>
              </p>
              <div className="mt-5 flex items-center gap-2">
                {socialLinks.map(({ label, href, icon: Icon }) =>
                  href ? (
                    <a
                      key={label}
                      href={href}
                      {...externalLinkProps}
                      aria-label={label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 text-slate-300 transition-colors hover:border-[#0066EB] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <span
                      key={label}
                      aria-label={`${label} link unavailable`}
                      aria-disabled="true"
                      title={`${label} link not configured`}
                      className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-sm border border-white/10 text-slate-500"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )
                )}
              </div>
            </div>

            {footerNavigation.mainSections.map(section => (
              <div key={section.title}>
                <p className="text-eyebrow text-slate-400">{section.title}</p>
                <ul className="mt-4 space-y-3">
                  {section.links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <p className="text-eyebrow text-slate-400">
                A BetterGov.ph Project
              </p>
              <img
                src="/assets/brand/logos/bettergov/bettergov-horizontal-onblack.webp"
                alt="BetterGov.ph"
                className="mt-4 h-10 w-[170px] max-w-full object-contain object-left"
              />
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Part of the BetterGov.ph community of independent
                civic-information projects.
              </p>
              <a
                href="https://bettergov.ph"
                {...externalLinkProps}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                Visit BetterGov.ph
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-5 text-xs text-slate-400 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>© 2026 BetterSanFernando</span>
              <span className="text-white/20" aria-hidden="true">
                ·
              </span>
              <a
                href="https://iansebastian.dev"
                {...externalLinkProps}
                className="group/creator inline-flex items-center gap-1.5 font-medium text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                Built by Ian Macabulos
                <Heart
                  className="h-3.5 w-3.5 fill-transparent text-white/40 opacity-0 transition-[opacity,color,fill] duration-300 ease-in-out group-hover/creator:fill-white group-hover/creator:text-white group-hover/creator:opacity-100 group-focus-visible/creator:fill-white group-focus-visible/creator:text-white group-focus-visible/creator:opacity-100"
                  aria-hidden="true"
                />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-300">
                Built for ₱435.39
              </span>
              <Link
                href="/sitemap"
                className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                Sitemap
              </Link>
              <Link
                href="/accessibility"
                className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
