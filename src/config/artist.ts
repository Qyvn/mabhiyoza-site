import { asset } from '../lib/asset';
import type { ArtistConfig } from '../types';

/**
 * CENTRAL ARTIST CONFIGURATION — MaBhiyoza
 * Links were checked on 23 Oct 2026 and resolve to artist pages named "MaBhiyoza" (Spotify, Apple Music).
 * Social profiles (Instagram, TikTok, X, YouTube, SoundCloud, Audiomack) could NOT be verified, so they are left empty and hidden.
 * The biography is a neutral DRAFT built only from public streaming listings. MaBhiyoza should replace it.
 * Images: graphic placeholders only. No artist photos have been supplied for this site yet.
 */
export const artist: ArtistConfig = {
  name: 'MaBhiyoza',
  tagline: 'Hip-hop · rap',
  logo: asset('/images/logo.svg'),
  heroImage: asset('/images/hero-graphic.svg'),
  heroImageMobile: asset('/images/hero-graphic-mobile.svg'),
  heroFocus: '60% 50%',
  // PHOTO SLOT: replace with an artist-supplied press photo
  profileImage: asset('/images/slots/press-photo.svg'),
  shortIntro: 'Spin the disc. Hear a taste. Stream the rest.',
  biography: [
    // DRAFT: based only on public Apple Music, Deezer and TIDAL listings. Replace with the artist's own words.
    'MaBhiyoza is a hip-hop and rap artist. The catalogue on streaming platforms includes the albums “Kasi Trap O’Clock” (2018) and “Impatha Yasemakhaya” (2023), along with singles such as “Nkri Nkri Nkri”, “Abo Dr Love”, “Ubambo Lwakho” and “Asanda”.',
  ],
  // Own palette: sunset orange and hot pink on black, with silver/chrome details.
  colors: {
    background: '#0b0a0c',
    surface: '#1a1418',
    text: '#f4f2f5',
    muted: '#b4b1ba',
    accent: '#ff8a1f',
    accent2: '#ff2d8a',
  },
  fonts: {
    display: '"Unbounded", "Arial Black", system-ui, sans-serif',
    body: '"Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    googleFontsHref: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;900&family=Inter:wght@400;500;600&display=swap',
  },
  // Only links with a non-empty URL are rendered.
  socials: [
    { label: 'Spotify', url: 'https://open.spotify.com/artist/74ksL8QoGPKkuzhTAxZ0fX' },
    { label: 'Apple Music', url: 'https://music.apple.com/za/artist/mabhiyoza/1525652577' },
    { label: 'TIDAL', url: 'https://tidal.com/browse/artist/20701647' },
    { label: 'YouTube', url: '' }, // not verified
    { label: 'Instagram', url: '' }, // not verified
    { label: 'TikTok', url: '' }, // not verified
    { label: 'X', url: '' }, // not verified
    { label: 'SoundCloud', url: '' }, // not verified
    { label: 'Audiomack', url: '' }, // not verified
  ],
  // PHOTO SLOTS: replace with artist-supplied photos
  gallery: [
    { src: asset('/images/slots/gallery-1.svg'), alt: 'Photo placeholder 1: artist photo to be added' },
    { src: asset('/images/slots/gallery-2.svg'), alt: 'Photo placeholder 2: artist photo to be added' },
    { src: asset('/images/slots/gallery-3.svg'), alt: 'Photo placeholder 3: artist photo to be added' },
  ],
  contact: {
    email: '', // not verified: add a booking/contact email
  },
  seo: {
    title: 'MaBhiyoza — Official Website',
    description: 'MaBhiyoza, hip-hop and rap. Spin the CD wheel, hear previews and stream “Impatha Yasemakhaya” and “Nkri Nkri Nkri”.',
    url: 'https://qyvn.github.io/mabhiyoza-site/',
    image: asset('/images/hero-graphic.svg'),
  },
  previewSeconds: 30,
};

export const PREVIEW_CAP_SECONDS = Math.min(30, artist.previewSeconds);
