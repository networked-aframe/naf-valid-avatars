import { createEffect, createSignal, For, onCleanup, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { getNameFromClientId } from './presence';

interface VideoThumbnailProps {
  video: HTMLVideoElement;
  name: string;
}

const VideoThumbnail = (props: VideoThumbnailProps) => {
  onMount(() => {
    divRef.appendChild(props.video);
    props.video.setAttribute('class', 'rounded-lg cursor-pointer');
  });

  onCleanup(() => {
    // detach video element from the DOM
    props.video.remove();
  });

  const [fullscreen, setFullscreen] = createSignal(false);

  let divRef!: HTMLDivElement;
  return (
    <div
      classList={{
        'absolute top-14 mt-3 h-48 w-48 md:static md:top-0 md:mt-0': !fullscreen(),
        'absolute bottom-0 left-2 right-2 top-14 mb-2 mt-2 flex justify-center': fullscreen(),
      }}
      onClick={() => {
        setFullscreen((v) => !v);
      }}
    >
      <div class="relative flex h-full">
        <span
          class="absolute left-0 flex justify-center"
          classList={{
            'top-0 m-2': !fullscreen(),
            'top-0 m-2 md:-top-10 md:left-0 md:right-0 md:m-0': fullscreen(),
          }}
        >
          <span class="flex rounded-lg bg-black/50 p-2 pb-1 pt-1 text-slate-50">{props.name}</span>
        </span>
        <div
          ref={divRef}
          classList={{
            'animation-pop flex grow [&>*]:h-full': fullscreen(),
          }}
        ></div>
      </div>
    </div>
  );
};

interface VideoAddedEvent {
  detail: { video: HTMLVideoElement; el: HTMLElement; clientId: string };
}

interface VideoRemovedEvent {
  detail: { video: HTMLVideoElement; el: HTMLElement; clientId: string };
}

const VideoThumbnailsInner = () => {
  const [videos, setVideos] = createStore<Array<{ video: HTMLVideoElement; el: HTMLElement; clientId: string }>>([]);
  createEffect(() => {
    const sceneEl = document.querySelector('a-scene');
    if (!sceneEl) return;

    const videoAddedListener = ({ detail: { video, el, clientId } }: VideoAddedEvent) => {
      setVideos([...videos, { video, el, clientId }]);
    };
    const videoRemovedListener = ({ detail: { video } }: VideoRemovedEvent) => {
      setVideos(videos.filter((e) => e.video !== video));
    };
    // @ts-ignore
    sceneEl.addEventListener('video-added', videoAddedListener);
    // @ts-ignore
    sceneEl.addEventListener('video-removed', videoRemovedListener);

    onCleanup(() => {
      // @ts-ignore
      sceneEl.removeEventListener('video-added', videoAddedListener);
      // @ts-ignore
      sceneEl.removeEventListener('video-removed', videoRemovedListener);
    });
  });

  return (
    <For each={videos}>
      {(entry) => <VideoThumbnail video={entry.video} name={getNameFromClientId(entry.clientId)} />}
    </For>
  );
};

export const VideoThumbnails = () => {
  return (
    <div class="pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 flex select-none justify-center p-2 [&>*]:pointer-events-auto">
      <VideoThumbnailsInner />
    </div>
  );
};
