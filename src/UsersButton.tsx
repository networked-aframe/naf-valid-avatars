import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { FiUsers } from 'solid-icons/fi';
import { BsMic, BsMicMute } from 'solid-icons/bs';
import { VsChromeClose } from 'solid-icons/vs';
import { setShowChatPanel } from './Chat';
import { audioEnabled } from './MicButton';
import { presences } from './presence';

export const [showUsersPanel, setShowUsersPanel] = createSignal(false);

export const UsersButton: Component = () => {
  const usersCount = createMemo(() => {
    return presences.length;
  });

  return (
    <>
      <button
        type="button"
        class="btn-secondary btn-rounded relative"
        classList={{ active: showUsersPanel() }}
        onClick={() => {
          setShowUsersPanel((v) => !v);
          if (showUsersPanel()) {
            setShowChatPanel(false);
          }
        }}
        title="Users"
      >
        <FiUsers size={24} />
        <span class="counter">{usersCount()}</span>
      </button>

      <Portal>
        <Show when={showUsersPanel()}>
          <div class="bg-panel absolute bottom-14 left-2 right-2 z-20 mb-3 mt-3 flex max-w-full flex-col space-y-4 rounded-lg p-4 shadow-lg ring-1 ring-black ring-opacity-5 sm:left-auto sm:w-screen sm:max-w-sm">
            <div class="flex justify-end space-x-2 pb-2">
              <button
                class="btn-secondary btn-rounded"
                type="button"
                title="Close"
                onClick={() => setShowUsersPanel(false)}
              >
                <VsChromeClose size={16} />
              </button>
            </div>
            <For each={presences}>
              {(p) => (
                <div class="flex items-center space-x-1 text-sm font-medium">
                  <Show when={!p.muted && audioEnabled()}>
                    <BsMic size={20} />
                  </Show>
                  <Show when={p.muted && audioEnabled()}>
                    <BsMicMute size={20} />
                  </Show>
                  <span>{p.name}</span>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Portal>
    </>
  );
};
