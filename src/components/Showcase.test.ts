import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Selector from './showcase/Selector.astro';

describe('Selector', () => {
  it('renders a tab per project with the active one marked', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Selector, {
      props: { projects: [
        { id: 'a', title: 'Alpha', iconPath: 'M0 0', active: true, summary: '', poster: '' },
        { id: 'b', title: 'Beta', iconPath: 'M0 0', active: false, summary: '', poster: '' },
      ] },
    });
    expect(html).toContain('Alpha');
    expect(html).toContain('Beta');
    expect(html).toMatch(/class="[^"]*tab[^"]*active/);
  });
});
