import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect } from 'vitest';
import Embed from './Embed.astro';

const img = { src: '/p.webp', width: 1280, height: 720, format: 'webp' } as any;
const project = {
  id: 'rt', title: 'RangeTube', summary: 's', iconPath: 'M0 0', active: true,
  mode: 'embed', embed: { url: 'https://rangetube.netlify.app', requiresLaunch: false, mobile: false },
  media: [{ type: 'image', src: img, alt: 'RangeTube' }],
} as any;

describe('Embed.astro', () => {
  it('renders an iframe with NO src, inert, tabindex=-1, and a cover + spinner', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Embed, { props: { project } });
    expect(html).toContain('data-embed-frame');
    expect(html).not.toMatch(/<iframe[^>]*\ssrc=/);
    expect(html).toContain('inert');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('data-embed-cover');
    expect(html).toContain('data-embed-spinner');
    expect(html).not.toContain('data-embed-poster');
  });

  it('renders a launch button only when requiresLaunch', async () => {
    const c = await AstroContainer.create();
    const off = await c.renderToString(Embed, { props: { project } });
    expect(off).not.toContain('data-embed-launch');
    const on = await c.renderToString(Embed, { props: { project: { ...project, embed: { ...project.embed, requiresLaunch: true } } } });
    expect(on).toContain('data-embed-launch');
  });
});
