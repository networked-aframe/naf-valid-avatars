/* global AFRAME */
import './assets/style.css';
import { render } from 'solid-js/web';
import { Show, createEffect, createResource, createSignal, onMount } from 'solid-js';
import { AvatarSelect, setGender, setOutfit } from './AvatarSelect';

// const randomColor = () => {
//   // @ts-ignore
//   return '#' + new THREE.Color(Math.random(), Math.random(), Math.random()).getHexString();
// };

const [showSettings, setShowSettings] = createSignal(false);
const [entered, setEntered] = createSignal(false);
const [username, setUsername] = createSignal('user-' + Math.round(Math.random() * 10000));
export const [avatarSrc, setAvatarSrc] = createSignal('');
// const [color, setColor] = createSignal(randomColor());

export const avatarsBaseUrl = 'https://cdn.jsdelivr.net/gh/c-frame/valid-avatars-glb@f8dee64/';
const fetchAvatars = async () => {
  const response = await fetch(avatarsBaseUrl + 'avatars.json');
  if (!response.ok) {
    return [];
  }
  const results = await response.json();
  return results;
};

const [avatars] = createResource(fetchAvatars);
const [avatarLoading, setAvatarLoading] = createSignal(true);

const setRandomAvatar = () => {
  const idx = Math.floor(Math.random() * avatars().length);
  const avatar = avatars()[idx];
  setAvatarSrc(avatarsBaseUrl + avatar.model);
  setOutfit(avatar.outfit);
  setGender(avatar.gender);
};

const ColorChangerAndUsername = () => {
  onMount(() => {
    const name = localStorage.getItem('username');
    if (name) {
      setUsername(name);
    }
  });

  createEffect(() => {
    const rig = document.getElementById('rig');
    // @ts-ignore
    rig?.setAttribute('player-info', {
      name: username(),
      // color: color(),
    });
    localStorage.setItem('username', username());
  });

  // createEffect(() => {
  //   if (!avatarSrc() && !avatars.loading && avatars() && avatars().length > 0) {
  //     setRandomAvatar();
  //   }
  // });

  // let colorChangerBtn!: HTMLButtonElement;
  let nametagInput!: HTMLInputElement;
  return (
    <div class="flex w-full max-w-3xl flex-col gap-4 p-4">
      <AvatarSelect avatars={!avatars.loading && avatars() ? avatars() : []} />
      {/* <button
        ref={colorChangerBtn}
        id="color-changer"
        class="h-7 w-7"
        style={`background-color:${color()};color:${color()}`}
        onClick={() => {
          setColor(randomColor());
        }}
      >
        ■
      </button> */}
      <div class="flex flex-col gap-2">
        <label class="font-bold" for="username">
          Your name
        </label>
        <input
          ref={nametagInput}
          class="h-7 w-48 px-1"
          id="username"
          value={username()}
          oninput={() => {
            setUsername(nametagInput.value);
          }}
        />
      </div>
    </div>
  );
};

const SettingsScreen = () => {
  return (
    <div class="bg-panel absolute inset-0 z-10 flex flex-col items-center justify-center gap-2">
      <ColorChangerAndUsername />
      <button
        type="button"
        id="saveSettingsButton"
        class="btn"
        onClick={() => {
          setShowSettings(false);
        }}
      >
        OK
      </button>
    </div>
  );
};

const EnterScreen = () => {
  return (
    <div class="bg-panel absolute inset-0 z-10 flex flex-col items-center justify-center gap-2">
      <ColorChangerAndUsername />
      <button
        type="button"
        id="playButton"
        class="btn"
        onClick={() => {
          if (!avatarSrc()) {
            setRandomAvatar();
          }
          // @ts-ignore
          AFRAME.scenes[0].emit('connect');
          setEntered(true);
        }}
      >
        Enter
      </button>
    </div>
  );
};

const BottomBar = () => {
  return (
    <div class="absolute bottom-6 left-6 z-10 flex items-center gap-4">
      <button
        type="button"
        id="settingsButton"
        class="btn text-sm"
        onClick={() => {
          setShowSettings(true);
        }}
      >
        Settings
      </button>
      <button
        type="button"
        class="btn text-sm"
        onClick={() => {
          setRandomAvatar();
        }}
        disabled={!(!avatars.loading && avatars() && avatars().length > 0) || avatarLoading()}
      >
        Random avatar
      </button>
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
  createEffect((prevAvatarSrc) => {
    const rig = document.getElementById('rig');
    // @ts-ignore
    rig.setAttribute('player-info', {
      avatarSrc: avatarSrc(),
    });
    if (prevAvatarSrc !== avatarSrc()) {
      setAvatarLoading(true);
    }
    return prevAvatarSrc;
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
        <BottomBar />
      </Show>
    </>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);
render(() => <App />, root);
