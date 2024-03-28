/* global NAF */
import { Component, createEffect, createMemo, createSignal, onCleanup, onMount, Show, untrack } from 'solid-js';
import { BsMic, BsMicMute } from 'solid-icons/bs';

const savedMicEnabled = localStorage.getItem('micEnabled');
export const [micEnabled, setMicEnabled] = createSignal(savedMicEnabled === 'true');
const [isConnected, setIsConnected] = createSignal(false);

export const [audioEnabled, setAudioEnabled] = createSignal(false);
export const [nafAdapter, setNafAdapter] = createSignal('');

const [domContentLoaded, setDomContentLoaded] = createSignal(false);

document.addEventListener('DOMContentLoaded', () => {
  setDomContentLoaded(true);
  const sceneEl = document.querySelector('a-scene');

  const sceneLoaded = () => {
    // @ts-ignore
    const settings = sceneEl?.getAttribute('networked-scene'); // this returns a string and not an object if scene is not loaded
    // @ts-ignore
    const adapter = settings.adapter;
    setNafAdapter(adapter);
    if (adapter !== 'easyrtc' && adapter !== 'janus') return;
    // @ts-ignore
    if (adapter === 'easyrtc' && !settings.audio) return;

    setAudioEnabled(true);
  };

  // @ts-ignore
  if (sceneEl.hasLoaded) {
    sceneLoaded();
  } else {
    // @ts-ignore
    sceneEl.addEventListener('loaded', sceneLoaded);
  }
});

interface Props {
  entity?: string;
}

export const MicButton: Component<Props> = (props) => {
  const iconMuted = createMemo(() => {
    return !micEnabled();
  });

  const title = createMemo(() => {
    if (!iconMuted()) {
      return 'Mute Mic';
    } else {
      return 'Unmute Mic';
    }
  });

  onMount(() => {
    if (NAF.connection.isConnected()) {
      setIsConnected(true);
    } else {
      const listener = () => {
        setIsConnected(true);
        NAF.connection.adapter?.enableMicrophone?.(untrack(micEnabled));
      };
      document.body.addEventListener('connected', listener);
      onCleanup(() => {
        document.body.removeEventListener('connected', listener);
      });
    }
  });

  createEffect(() => {
    if (!domContentLoaded()) return;
    const info = { muted: iconMuted() };
    // @ts-ignore
    document.querySelector(props.entity ?? '#player')?.setAttribute('player-info', info);
  });

  createEffect(() => {
    const enabled = micEnabled();
    localStorage.setItem('micEnabled', enabled.toString());
    if (isConnected()) {
      if (!NAF.connection.adapter?.enableMicrophone) {
        console.error(
          `The specified NAF adapter doesn't have the enableMicrophone method, please be sure you have networked-scene="adapter:easyrtc;audio:true" options and networked-audio-source on your avatar template.`,
        );
        return;
      }
      NAF.connection.adapter.enableMicrophone(enabled);
    }
  });

  return (
    <Show when={audioEnabled()}>
      <button
        class="btn-secondary btn-rounded"
        classList={{ active: !iconMuted() }}
        onClick={() => {
          setMicEnabled((enabled) => !enabled);
          // @ts-ignore
          document.activeElement.blur();
          document.body.focus();
        }}
        title={title()}
      >
        <Show when={!iconMuted()}>
          <BsMic size={24} />
        </Show>
        <Show when={iconMuted()}>
          <BsMicMute size={24} />
        </Show>
      </button>
    </Show>
  );
};
