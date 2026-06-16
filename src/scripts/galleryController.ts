/**
 * Client wiring for every MediaGallery on the page: carousel interaction (arrows,
 * thumbnails, keyboard) and video autoplay-on-visible / pause-on-exit.
 * Index math lives in galleryNav.ts (pure, unit-tested). Reduced-motion: the static
 * poster is shown via CSS; here we additionally never load/play the video under reduce.
 */
import { nextIndex, prevIndex, wrapIndex } from './galleryNav';

const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupGallery(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-track]');
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
  const thumbs = Array.from(root.querySelectorAll<HTMLElement>('[data-thumb]'));
  const counter = root.querySelector<HTMLElement>('[data-counter]');
  const n = slides.length;
  if (!track || n === 0) return;

  let index = 0;
  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    if (counter) counter.textContent = `${index + 1} / ${n}`;
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i === index ? 'false' : 'true'));
    thumbs.forEach((t, i) => {
      t.classList.toggle('on', i === index);
      t.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  };
  const goTo = (i: number) => { index = wrapIndex(i, n); update(); };

  root.querySelector('[data-prev]')?.addEventListener('click', () => goTo(prevIndex(index, n)));
  root.querySelector('[data-next]')?.addEventListener('click', () => goTo(nextIndex(index, n)));
  thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(prevIndex(index, n)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(nextIndex(index, n)); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(n - 1); }
  });

  // Video: lazy-load + play when visible, pause when not. Skip entirely under reduced motion.
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('[data-video]'));
  if (videos.length && !reduceMotion()) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const v = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          if (!v.dataset.loaded) {
            v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => {
              s.src = s.dataset.src as string;
            });
            v.load();
            v.dataset.loaded = '1';
          }
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    }, { threshold: 0.25, rootMargin: '200px 0px' });
    videos.forEach((v) => io.observe(v));
  }

  update();
}

document.querySelectorAll<HTMLElement>('[data-gallery]').forEach(setupGallery);
