/* global NAF */
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show, untrack } from 'solid-js';
import { BsMic, BsMicMute } from 'solid-icons/bs';

const savedMicEnabled = localStorage.getItem('micEnabled');
export const [micEnabled, setMicEnabled] = createSignal(savedMicEnabled === 'true');
const [isConnected, setIsConnected] = createSignal(false);

export const MicButton = () => {
  const sceneEl = document.querySelector('a-scene');
  // @ts-ignore
  const settings = sceneEl?.getAttribute('networked-scene');
  // @ts-ignore
  const adapter = settings.adapter;
  if (adapter !== 'easyrtc' && adapter !== 'janus') return null;
  // @ts-ignore
  if (adapter === 'easyrtc' && !settings.audio) return null;

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
    const cameraRig = document.querySelector('#rig,#cameraRig');
    if (cameraRig) {
      // @ts-ignore
      cameraRig.setAttribute('player-info', { muted: iconMuted() });
    }
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
  );
};
