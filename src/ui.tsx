/* global AFRAME */
import './assets/style.css';
import { render } from 'solid-js/web';
import { Show, createEffect, createResource, createSignal, onMount } from 'solid-js';
import { IoSettingsOutline } from 'solid-icons/io';
import { Avatar, AvatarSelect, defaultOutfits, setGender, setOutfit } from './AvatarSelect';
import { MicButton } from './MicButton';
import { UsernameInput } from './UsernameInput';
import { ChatButton } from './Chat';
import { UsersButton } from './UsersButton';
import { uiSettings } from './config';

const [showSettings, setShowSettings] = createSignal(false);
const [entered, setEntered] = createSignal(false);
export const [avatarSrc, setAvatarSrc] = createSignal('');

export const avatarsBaseUrl = 'https://cdn.jsdelivr.net/gh/c-frame/valid-avatars-glb@c539a28/';
const fetchAvatars = async () => {
  const response = await fetch(avatarsBaseUrl + 'avatars.json');
  if (!response.ok) {
    return [];
  }
  const results = await response.json();
  return results;
};

const [avatars] = createResource<Avatar[]>(fetchAvatars);
export const [avatarLoading, setAvatarLoading] = createSignal(false);

const setRandomAvatar = () => {
  const outfits = uiSettings.outfits ?? defaultOutfits;
  const allAvatars = avatars();
  if (!allAvatars) return;
  const filteredAvatars = allAvatars.filter((avatar) => outfits.includes(avatar.outfit));
  const idx = Math.floor(Math.random() * filteredAvatars.length);
  const avatar = filteredAvatars[idx];
  setAvatarSrc(avatarsBaseUrl + avatar.model);
  setOutfit(avatar.outfit);
  setGender(avatar.gender);
};

const UserForm = () => {
  return (
    <div class="flex w-full max-w-3xl flex-col gap-4 p-4">
      <AvatarSelect avatars={avatars() ?? []} outfits={uiSettings.outfits} />
      <div class="flex flex-col gap-2">
        <label class="font-bold" for="username">
          Your name
        </label>
        <UsernameInput entity="#rig" enableColorPicker={false} />
      </div>
    </div>
  );
};

const SettingsScreen = () => {
  return (
    <div class="naf-centered-fullscreen">
      <UserForm />
      <button
        type="button"
        id="saveSettingsButton"
        class="btn min-w-[100px]"
        onClick={() => {
          setShowSettings(false);
        }}
      >
        Close
      </button>
    </div>
  );
};

const EnterScreen = () => {
  return (
    <div class="naf-centered-fullscreen">
      <UserForm />
      <button
        type="button"
        id="playButton"
        class="btn min-w-[100px]"
        onClick={() => {
          if (!avatarSrc()) {
            setRandomAvatar();
          }

          const sceneEl = document.querySelector('a-scene');
          // @ts-ignore
          sceneEl?.emit('connect');
          setEntered(true);
        }}
      >
        Enter
      </button>
    </div>
  );
};

const TopBarRight = () => {
  return (
    <div class="naf-top-bar-right">
      <Show when={uiSettings.showRandomAvatarButton}>
        <button
          type="button"
          class="btn text-sm"
          onClick={() => {
            setRandomAvatar();
          }}
          disabled={!((avatars() ?? []).length > 0) || avatarLoading()}
        >
          Random avatar
        </button>
      </Show>
      <Show when={uiSettings.showDieButton}>
        <button
          type="button"
          class="btn text-sm"
          onClick={() => {
            // @ts-ignore
            document.getElementById('rig').setAttribute('player-info', 'state', 'Dying');
          }}
        >
          Die
        </button>
      </Show>
    </div>
  );
};

const BottomBarCenter = () => {
  return (
    <div class="naf-bottom-bar-center">
      <button
        type="button"
        id="settingsButton"
        class="btn-secondary btn-rounded"
        onClick={() => {
          setShowSettings(true);
        }}
        title="Settings"
      >
        <IoSettingsOutline size={24} />
      </button>
      <MicButton entity="#rig" />
      <UsersButton />
      <ChatButton />
    </div>
  );
};

const App = () => {
  onMount(() => {
    const rig = document.getElementById('rig');
    rig?.addEventListener('model-loaded', () => {
      setAvatarLoading(false);
    });
  });

  createEffect(() => {
    if (avatarSrc()) {
      setAvatarLoading(true);
      const rig = document.getElementById('rig');
      // @ts-ignore
      rig.setAttribute('player-info', {
        avatarSrc: avatarSrc(),
      });
    }
  });

  return (
    <>
      <Show when={!entered()}>
        <EnterScreen />
      </Show>
      <Show when={showSettings()}>
        <SettingsScreen />
      </Show>
      <Show when={entered() && !showSettings()}>
        <TopBarRight />
        <BottomBarCenter />
      </Show>
    </>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);
render(() => <App />, root);
