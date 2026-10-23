import { asset } from '../lib/asset';
import type { Song } from '../types';

/**
 * SONG DATA — MaBhiyoza
 * Titles and Apple Music release links verified on 23 Oct 2026 (Apple Music artist page + Deezer/TIDAL listings).
 * Artwork: GRAPHIC PLACEHOLDERS (not official covers).
 * ⚠ PREVIEW AUDIO IS PLACEHOLDER: synthesised test tones in /public/audio, NOT MaBhiyoza's music.
 * Track-level Spotify / YouTube links were not verified, so they are empty and hidden.
 */
const PLACEHOLDER = 'Placeholder tone, not the real song';

export const songs: Song[] = [
  {
    id: 'nkri-nkri-nkri',
    title: 'Nkri Nkri Nkri',
    subtitle: `feat. ThisGuy ThatGuy & 04our · Single · 2023 · ${PLACEHOLDER}`,
    artwork: asset('/images/covers/nkri-nkri-nkri.svg'),
    previewUrl: asset('/audio/placeholder-tone-1.mp3'),
    spotifyUrl: '',
    appleMusicUrl: 'https://music.apple.com/za/album/nkri-nkri-nkri-feat-thisguy-thatguy-04our-single/1701476408',
    youtubeMusicUrl: '',
    youtubeUrl: '',
  },
  {
    id: 'impatha-yasemakhaya',
    title: 'Impatha Yasemakhaya',
    subtitle: `Title track · Impatha Yasemakhaya · 2023 · ${PLACEHOLDER}`,
    artwork: asset('/images/covers/impatha-yasemakhaya.svg'),
    previewUrl: asset('/audio/placeholder-tone-2.mp3'),
    spotifyUrl: '',
    appleMusicUrl: 'https://music.apple.com/za/album/impatha-yasemakhaya/1703889298',
    youtubeMusicUrl: '',
    youtubeUrl: '',
  },
  {
    id: 'abo-dr-love',
    title: 'Abo Dr Love',
    subtitle: `feat. Ayarhkay · Single · 2023 · ${PLACEHOLDER}`,
    artwork: asset('/images/covers/abo-dr-love.svg'),
    previewUrl: asset('/audio/placeholder-tone-3.mp3'),
    spotifyUrl: '',
    appleMusicUrl: 'https://music.apple.com/za/album/abo-dr-love-feat-ayarhkay-single/1700606175',
    youtubeMusicUrl: '',
    youtubeUrl: '',
  },
  {
    id: 'mshanam',
    title: 'Mshanam',
    subtitle: `04our & MaBhiyoza · Single · 2024 · ${PLACEHOLDER}`,
    artwork: asset('/images/covers/mshanam.svg'),
    previewUrl: asset('/audio/placeholder-tone-4.mp3'),
    spotifyUrl: '',
    appleMusicUrl: 'https://music.apple.com/za/album/mshanam-single/1742660381',
    youtubeMusicUrl: '',
    youtubeUrl: '',
  },
  {
    id: 'ubambo-lwakho',
    title: 'Ubambo Lwakho',
    subtitle: `Single · 2022 · ${PLACEHOLDER}`,
    artwork: asset('/images/covers/ubambo-lwakho.svg'),
    previewUrl: '', // no preview tone assigned: shows 'Preview unavailable'
    spotifyUrl: '',
    appleMusicUrl: 'https://music.apple.com/za/album/ubambo-lwakho-single/1621827236',
    youtubeMusicUrl: '',
    youtubeUrl: '',
  },
  {
    id: 'asanda',
    title: 'Asanda',
    subtitle: `Single · 2021 · ${PLACEHOLDER}`,
    artwork: asset('/images/covers/asanda.svg'),
    previewUrl: asset('/audio/placeholder-tone-2.mp3'),
    spotifyUrl: '',
    appleMusicUrl: 'https://music.apple.com/za/album/asanda-single/1586173790',
    youtubeMusicUrl: '',
    youtubeUrl: '',
  },
];
