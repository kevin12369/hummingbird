import React from 'react';

interface Badge {
  src: string;
  alt: string;
  href?: string;
}

const BASE_BADGES: Badge[] = [
  {
    src: 'https://img.shields.io/github/actions/workflow/status/kevin12369/hummingbird/ci.yml?style=flat-square&label=CI',
    alt: 'CI passing',
    href: 'https://github.com/kevin12369/hummingbird/actions',
  },
  {
    src: 'https://img.shields.io/badge/tests-227%20passing-brightgreen?style=flat-square',
    alt: 'Tests 227 passing',
  },
  {
    src: 'https://img.shields.io/github/deployments/kevin12369/hummingbird/github-pages?style=flat-square&label=GitHub%20Pages',
    alt: 'GitHub Pages live',
    href: 'https://kevin12369.github.io/hummingbird/',
  },
  {
    src: 'https://img.shields.io/github/license/kevin12369/hummingbird?style=flat-square',
    alt: 'License MIT',
  },
  {
    src: 'https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript&logoColor=white',
    alt: 'TypeScript strict',
  },
  {
    src: 'https://img.shields.io/badge/styles-12-ff44aa?style=flat-square',
    alt: '12 styles',
  },
  {
    src: 'https://img.shields.io/badge/stems-4-3aa6ff?style=flat-square',
    alt: '4 stems',
  },
  {
    src: 'https://img.shields.io/badge/LLM-browser%20direct-orange?style=flat-square',
    alt: 'Browser direct LLM',
  },
];

/**
 * Row of shields.io badges for the landing page (CI, tests, Pages, license,
 * TypeScript strict, 12 styles, 4 stems, browser-direct LLM).
 * Wraps automatically on narrow screens.
 */
export function StatusBadges() {
  return (
    <section className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 justify-center items-center">
          {BASE_BADGES.map((badge, idx) => {
            const img = (
              <img
                src={badge.src}
                alt={badge.alt}
                loading="lazy"
                className="h-5"
              />
            );
            if (badge.href) {
              return (
                <a
                  key={idx}
                  href={badge.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  {img}
                </a>
              );
            }
            return <span key={idx}>{img}</span>;
          })}
        </div>
      </div>
    </section>
  );
}