import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Selector from './Selector.astro';

const projects = [
  { id: 'alpha', title: 'Alpha Project', iconPath: 'M3 3h18', active: true },
  { id: 'beta', title: 'Beta Project With A Very Long Title', iconPath: 'M3 3h18', active: false },
];

async function render(p: any[]) {
  const container = await AstroContainer.create();
  return container.renderToString(Selector, { props: { projects: p } });
}

describe('Selector', () => {
  it('renders each title inside a .tab-label span so it can be ellipsized', async () => {
    const html = await render(projects);
    expect((html.match(/class="tab-label"/g) ?? []).length).toBe(2);
    // Tolerate Astro's injected data-astro-source-* attributes between the
    // class and the tag close (see Stage.test.ts, same container renderer).
    expect(html).toMatch(/<span class="tab-label"[^>]*>Alpha Project<\/span>/);
  });
  it('marks the active project tab', async () => {
    const html = await render(projects);
    expect(html).toMatch(/class="tab active"/);
  });
});
