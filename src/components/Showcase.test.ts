import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Selector from './showcase/Selector.astro';

describe('Selector', () => {
  it('renders a tab per project with the active one marked', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Selector, {
      props: { projects: [
        { id: 'a', title: 'Alpha', iconPath: 'M0 0', active: true, summary: '', media: [] },
        { id: 'b', title: 'Beta', iconPath: 'M0 0', active: false, summary: '', media: [] },
      ] },
    });
    expect(html).toContain('Alpha');
    expect(html).toContain('Beta');
    expect(html).toMatch(/class="[^"]*tab[^"]*active/);
  });

  it('exposes the tabs with APG tablist semantics and roving tabindex', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Selector, {
      props: { projects: [
        { id: 'a', title: 'Alpha', iconPath: 'M0 0', active: true,  summary: '', media: [], accent: '#abc' },
        { id: 'b', title: 'Beta',  iconPath: 'M0 0', active: false, summary: '', media: [] },
      ] },
    });
    expect(html).toMatch(/role="tablist"/);
    expect((html.match(/role="tab"/g) ?? []).length).toBe(2);
    expect(html).toMatch(/aria-selected="true"[^>]*tabindex="0"|tabindex="0"[^>]*aria-selected="true"/);
    expect(html).toContain('aria-controls="panel-a"');
    expect(html).toContain('id="tab-a"');
    expect(html).toContain('aria-selected="false"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('data-accent="#abc"');
  });
});
