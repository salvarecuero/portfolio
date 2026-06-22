import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Stage from './Stage.astro';
import placeholder from '../../assets/posters/placeholder.webp';

const img = (alt: string) => ({ type: 'image' as const, src: placeholder, alt });

async function render(project: any) {
  const container = await AstroContainer.create();
  return container.renderToString(Stage, { props: { project } });
}

describe('Stage', () => {
  it('renders a desktop gallery for the project media', async () => {
    const html = await render({ title: 'A', summary: 's', media: [img('a0'), img('a1')] });
    expect(html).toMatch(/media-gallery--desktop/);
    expect(html).not.toMatch(/media-gallery--mobile/);
  });
  it('renders a mobile gallery when mediaMobile is present', async () => {
    const html = await render({ title: 'A', summary: 's', media: [img('a0')], mediaMobile: [img('a0m')] });
    expect(html).toMatch(/media-gallery--desktop/);
    expect(html).toMatch(/media-gallery--mobile/);
  });
  it('embed mode: data-embed-url, the Embed iframe, and a mobile MediaGallery fallback', async () => {
    const c = await AstroContainer.create();
    const imgMeta = { src: '/p.webp', width: 1280, height: 720, format: 'webp' } as any;
    const project = {
      id: 'rt', title: 'RangeTube', summary: 's', iconPath: 'M0 0', active: true,
      mode: 'embed', embed: { url: 'https://rangetube.netlify.app', requiresLaunch: false, mobile: false },
      media: [{ type: 'image', src: imgMeta, alt: 'RangeTube' }],
    } as any;
    const html = await c.renderToString(Stage, { props: { project, active: true } });
    expect(html).toContain('data-embed-url="https://rangetube.netlify.app"');
    expect(html).toContain('data-embed-frame');
    expect(html).toContain('media-gallery--mobile');
    expect(html).toContain('media-gallery--desktop');
  });
});
