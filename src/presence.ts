/* global NAF */
import { createStore } from 'solid-js/store';

export interface Presence {
  id: string;
  muted: boolean;
  name: string;
}

export const [presences, setPresences] = createStore<Presence[]>([]);

export const getNameFromClientId = (clientId: string) => {
  const p = presences.find((p) => p.id === clientId);
  if (!p) {
    return 'Unknown';
  }
  return p.name;
};

document.body.addEventListener('clientDisconnected', (evt) => {
  // @ts-ignore
  setPresences(presences.filter((p) => p.id !== evt.detail.clientId));
});

document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  if (!sceneEl) return;

  // @ts-ignore
  const listener = (evt) => {
    const { el, data, oldData } = evt.detail;
    const clientId = el.components?.networked?.data?.owner;
    if (!clientId) {
      // no clientId, that's me
      return;
    }

    if (!el.components['player-info'].presenceAdded) {
      setPresences(presences.length, { id: clientId, muted: data.muted, name: data.name });
      el.components['player-info'].presenceAdded = true;
    } else if (oldData) {
      if (oldData.muted !== data.muted) {
        setPresences((p) => p.id === clientId, 'muted', data.muted);
      }

      if (oldData.name !== data.name) {
        setPresences((p) => p.id === clientId, 'name', data.name);
      }
    }
  };

  sceneEl.addEventListener('player-info-updated', listener);

  const me = document.querySelector('[player-info]');
  const listenerConnected = async () => {
    // Clear the store
    setPresences([]);
    // @ts-ignore
    me.components['player-info'].presenceAdded = false;
    await NAF.utils.getNetworkedEntity(me); // to be sure me.components?.networked?.data?.owner is set
    // @ts-ignore
    listener({ detail: { el: me, data: me.components['player-info'].data }, oldData: {} });
  };
  document.body.addEventListener('connected', listenerConnected);
});
