import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MediaGallery from './MediaGallery.astro';
import placeholder from '../../assets/posters/placeholder.webp';

const imageItem = { type: 'image' as const, src: placeholder, alt: 'overview' };
const videoItem = {
  type: 'video' as const,
  poster: placeholder,
  alt: 'live demo',
  sources: [
    { src: '/media/demo.av1.webm', type: 'video/webm; codecs=av01.0.05M.08' },
    { src: '/media/demo.h264.mp4', type: 'video/mp4' },
  ],
};

async function render(items: any[], variant: 'desktop' | 'mobile' = 'desktop') {
  const container = await AstroContainer.create();
  return container.renderToString(MediaGallery, { props: { items, variant } });
}

describe('MediaGallery', () => {
  it('renders one slide and one thumbnail per item', async () => {
    const html = await render([imageItem, imageItem, imageItem]);
    expect((html.match(/data-slide/g) ?? []).length).toBe(3);
    expect((html.match(/data-thumb=/g) ?? []).length).toBe(3);
  });
  it('shows a 1 / N counter and prev/next controls', async () => {
    const html = await render([imageItem, imageItem]);
    expect(html).toContain('1 / 2');
    expect(html).toContain('data-prev');
    expect(html).toContain('data-next');
  });
  it('renders an <img> for image items', async () => {
    const html = await render([imageItem]);
    expect(html).toMatch(/<img[^>]+alt="overview"/);
  });
  it('renders a <video> with one <source> per source plus a poster <img> for video items', async () => {
    const html = await render([videoItem]);
    expect(html).toContain('<video');
    expect((html.match(/data-src=/g) ?? []).length).toBe(2);
    expect(html).toMatch(/gallery-media--poster/);
  });
  it('tags the variant on the root for CSS show/hide', async () => {
    const html = await render([imageItem], 'mobile');
    expect(html).toMatch(/media-gallery--mobile/);
  });
  // The thumbnail strip follows the WAI-ARIA APG "carousel" slide-picker pattern:
  // a labelled group of buttons, not a tablist (no tabpanels/aria-controls exist).
  it('exposes the thumbnail strip as a labelled group, not a tablist', async () => {
    const html = await render([imageItem, imageItem]);
    expect(html).toMatch(/class="gallery-thumbs"[^>]*role="group"/);
    expect(html).toContain('aria-label="Choose media"');
    expect(html).not.toContain('role="tablist"');
  });
  it('uses plain buttons without tab semantics for thumbnails', async () => {
    const html = await render([imageItem, imageItem]);
    expect(html).not.toContain('role="tab"');
    expect(html).not.toContain('aria-selected');
  });
  it('marks the active thumbnail with aria-current and keeps descriptive labels', async () => {
    const html = await render([imageItem, imageItem]);
    expect((html.match(/aria-current="true"/g) ?? []).length).toBe(1);
    expect(html).toContain('aria-label="Show: overview"');
  });
});
