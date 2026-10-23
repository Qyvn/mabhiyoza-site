import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicSection } from '../components/MusicSection';
import { StreamingLinks } from '../components/StreamingLinks';
import { streamingLinks } from '../lib/links';
import type { Song } from '../types';
import { FakeAudio } from './fakeAudio';

const base = { spotifyUrl: '', appleMusicUrl: '', youtubeMusicUrl: '', youtubeUrl: '' };
const songs: Song[] = [
  { id: 'a', title: 'Alpha', artwork: '/a.svg', previewUrl: '/audio/a.mp3', ...base, spotifyUrl: 'https://open.spotify.com/track/x' },
  { id: 'b', title: 'Bravo', artwork: '/b.svg', previewUrl: '/audio/b.mp3', ...base },
  { id: 'c', title: 'Charlie', artwork: '/c.svg', previewUrl: '', ...base, youtubeUrl: 'https://www.youtube.com/watch?v=x' },
];

const audio = () => FakeAudio.instances[FakeAudio.instances.length - 1];
/** Flip the crate to a record by title, then put it on the turntable. */
const load = async (title: string) => {
  for (let i = 0; i < 10 && !screen.getByText('In hand').parentElement!.textContent!.includes(title); i++)
    await userEvent.click(screen.getByRole('button', { name: 'Flip to next record' }));
  await userEvent.click(screen.getByRole('button', { name: new RegExp(`^Put ${title} on the turntable`) }));
};

beforeEach(() => {
  FakeAudio.instances = [];
  vi.stubGlobal('Audio', FakeAudio);
});

describe('preview player', () => {
  it('does not autoplay on load or on selection', async () => {
    render(<MusicSection songs={songs} capSeconds={30} />);
    expect(audio().playCalls).toBe(0);
    await load('Alpha');
    expect(audio().src).toBe('/audio/a.mp3');
    expect(audio().playCalls).toBe(0);
    expect(screen.getByTestId('status')).toHaveTextContent('Needle up');
  });

  it('hard-caps playback at 30 seconds', async () => {
    render(<MusicSection songs={songs} capSeconds={30} />);
    await load('Alpha');
    await userEvent.click(screen.getByRole('button', { name: 'Drop the needle' }));
    expect(screen.getByTestId('status')).toHaveTextContent('Playing');
    act(() => audio().tick(12));
    expect(screen.getByTestId('status')).toHaveTextContent('Playing');
    act(() => audio().tick(30.1));
    expect(audio().paused).toBe(true);
    expect(screen.getByTestId('status')).toHaveTextContent('Preview ended');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30');
  });

  it('never allows a cap above 30s even if configured higher', async () => {
    render(<MusicSection songs={songs} capSeconds={90} />);
    await load('Alpha');
    await userEvent.click(screen.getByRole('button', { name: 'Drop the needle' }));
    act(() => audio().tick(30));
    expect(audio().paused).toBe(true);
  });

  it('replay restarts from 0 after the cap', async () => {
    render(<MusicSection songs={songs} capSeconds={30} />);
    await load('Alpha');
    await userEvent.click(screen.getByRole('button', { name: 'Drop the needle' }));
    act(() => audio().tick(30));
    await userEvent.click(screen.getByRole('button', { name: /Replay/ }));
    expect(audio().currentTime).toBe(0);
    expect(audio().playCalls).toBe(2);
    expect(screen.getByTestId('status')).toHaveTextContent('Playing');
  });

  it('switching songs stops the previous preview and does not autoplay the next', async () => {
    render(<MusicSection songs={songs} capSeconds={30} />);
    await load('Alpha');
    await userEvent.click(screen.getByRole('button', { name: 'Drop the needle' }));
    act(() => audio().tick(5));
    await load('Bravo');
    expect(audio().paused).toBe(true);
    expect(audio().src).toBe('/audio/b.mp3');
    expect(audio().playCalls).toBe(1);
    expect(screen.getByTestId('status')).toHaveTextContent('Needle up');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows unavailable message, disables playback and still offers configured links', async () => {
    render(<MusicSection songs={songs} capSeconds={30} />);
    await load('Charlie');
    expect(screen.getByTestId('status')).toHaveTextContent('Preview unavailable');
    expect(screen.getByText(/No preview is available/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Drop the needle' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Replay/ })).toBeDisabled();
    expect(screen.getByRole('link', { name: /YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=x');
    expect(audio().playCalls).toBe(0);
  });

  it('shows an error state when the audio fails to load', async () => {
    render(<MusicSection songs={songs} capSeconds={30} />);
    await load('Bravo');
    act(() => { audio().dispatchEvent(new Event('error')); });
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load/);
    expect(screen.getByRole('button', { name: 'Drop the needle' })).toBeDisabled();
  });

  it('crate flips with buttons and arrow keys; loading cues without playing', async () => {
    render(<MusicSection songs={songs} capSeconds={30} />);
    await userEvent.click(screen.getByRole('button', { name: 'Flip to next record' }));
    expect(screen.getByText('In hand').parentElement).toHaveTextContent('Bravo');
    screen.getByLabelText(/Record crate/).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByText('In hand').parentElement).toHaveTextContent('Charlie');
    await userEvent.click(screen.getByRole('button', { name: /^Put Charlie on the turntable/ }));
    expect(screen.getByRole('button', { name: /Charlie on the turntable \(on the platter\)/ })).toHaveAttribute('aria-pressed', 'true');
    expect(audio().playCalls).toBe(0);
  });

  it('scratch gesture scrubs within the 30s cap', async () => {
    render(<MusicSection songs={songs} capSeconds={30} />);
    await load('Alpha');
    const platter = screen.getByTestId('platter');
    platter.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0, toJSON() {} });
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.pointerDown(platter, { clientX: 200, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(platter, { clientX: 100, clientY: 200, pointerId: 1 });
    fireEvent.pointerMove(platter, { clientX: 0, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(platter, { pointerId: 1 });
    expect(audio().currentTime).toBeCloseTo(0.9, 1);
    expect(audio().playCalls).toBe(0);
  });
});

describe('streaming links', () => {
  const s: Song = { id: 'x', title: 'X', artwork: '', previewUrl: '', spotifyUrl: 'https://open.spotify.com/t', appleMusicUrl: '',
    youtubeMusicUrl: '   ', youtubeUrl: 'not a url' };
  it('only renders buttons for non-empty valid URLs', () => {
    render(<StreamingLinks song={s} />);
    const list = screen.getByRole('list');
    const links = within(list).getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent('Spotify');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });
  it('renders no buttons when nothing is configured', () => {
    render(<StreamingLinks song={{ ...s, spotifyUrl: '', youtubeUrl: '' }} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(streamingLinks({ ...s, spotifyUrl: '' })).toEqual([]);
  });
});
