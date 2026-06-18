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
  it('renders each project title inside a .tab-label span plus the Portfolio tab', async () => {
    const html = await render(projects);
    expect((html.match(/class="tab-label"/g) ?? []).length).toBe(3);
    expect(html).toMatch(/<span class="tab-label"[^>]*>Alpha Project<\/span>/);
    expect(html).toMatch(/<span class="tab-label"[^>]*>Portfolio<\/span>/);
  });
  it('marks the active project tab', async () => {
    const html = await render(projects);
    expect(html).toMatch(/class="tab active"/);
  });
  it('renders the Portfolio tab as a real tab inside the tablist', async () => {
    const html = await render(projects);
    expect((html.match(/role="tab"/g) ?? []).length).toBe(3);
    expect(html).toContain('id="tab-portfolio"');
    expect(html).toContain('data-project="portfolio"');
    expect(html).toContain('aria-controls="panel-portfolio"');
    const tablistOpen = html.indexOf('role="tablist"');
    const tablistClose = html.indexOf('</div>', tablistOpen);
    expect(html.indexOf('id="tab-portfolio"')).toBeLessThan(tablistClose);
  });
});
