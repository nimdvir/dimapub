// Cloudinary delivery helpers. All brand media lives in the `dimapub` folder of the
// dkndq6lyz cloud; transformations resize and convert on the fly, so the 4 MB source
// GIFs reach visitors as ~150 KB video loops.

const BASE = 'https://res.cloudinary.com/dkndq6lyz';

/** Optimized still image (AVIF/WebP/JPEG chosen per browser). */
export function img(publicId: string, width: number, extra = '') {
  const pre = extra ? `${extra}/` : '';
  return `${BASE}/image/upload/${pre}c_scale,w_${width}/f_auto/q_auto/${publicId}`;
}

/** 1200×630 social preview: the cover centered on the night-blue brand color. */
export function ogImage(publicId: string) {
  return `${BASE}/image/upload/b_rgb:0e1424,c_pad,h_630,w_1200/f_jpg/q_auto/${publicId}`;
}

/** Responsive srcset for an image. */
export function srcset(publicId: string, widths: number[], extra = '') {
  return widths.map((w) => `${img(publicId, w, extra)} ${w}w`).join(', ');
}

/** An animated GIF delivered as a silent video loop. */
export function gifVideo(publicId: string, width: number) {
  return {
    webm: `${BASE}/image/upload/c_scale,w_${width}/f_webm/${publicId}.webm`,
    mp4: `${BASE}/image/upload/c_scale,w_${width}/f_mp4/${publicId}.mp4`,
    poster: `${BASE}/image/upload/pg_1/c_scale,w_${width}/f_auto/q_auto/${publicId}`,
  };
}

/** A real video asset, muted and compressed. */
export function video(publicId: string, width: number) {
  return {
    mp4: `${BASE}/video/upload/c_scale,w_${width}/ac_none/q_auto/f_mp4/${publicId}.mp4`,
    webm: `${BASE}/video/upload/c_scale,w_${width}/ac_none/q_auto/f_webm/${publicId}.webm`,
    poster: `${BASE}/video/upload/c_scale,w_${width}/so_1/f_auto/q_auto/${publicId}.jpg`,
  };
}

export const media = {
  diamond: 'dimapub/dima-diamond',
  reading: 'dimapub/dima-logo-reading',
  loop: 'dimapub/dima-loop',
  cover: 'dimapub/book-cover',
  coverGold: 'dimapub/book-cover-gold',
  conceptMap: 'dimapub/book-concept-map',
  dimaSunset: 'dimapub/dima-sunset',
  dimaPillow: 'dimapub/dima-pillow',
  dimaSweater: 'dimapub/dima-sweater',
};
