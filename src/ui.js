/* global AFRAME THREE */
import './assets/style.css';
import { render } from 'solid-js/web';
import { Show, createEffect, createSignal, onMount } from 'solid-js';

const randomColor = () => {
  return '#' + new THREE.Color(Math.random(), Math.random(), Math.random()).getHexString();
};

const [showSettings, setShowSettings] = createSignal(false);
const [entered, setEntered] = createSignal(false);
const [username, setUsername] = createSignal('user-' + Math.round(Math.random() * 10000));
const [color, setColor] = createSignal(randomColor());

const ColorChangerAndUsername = () => {
  onMount(() => {
    const name = localStorage.getItem('username');
    if (name) {
      setUsername(name);
    }
  });

  createEffect(() => {
    const player = document.getElementById('player');
    if (player) {
      player.setAttribute('player-info', {
        name: username(),
        color: color(),
      });
    }
    localStorage.setItem('username', username());
  });

  let colorChangerBtn, nametagInput;
  return (
    <div>
      <button
        ref={colorChangerBtn}
        id="color-changer"
        class="h-7 w-7"
        style={`background-color:${color()};color:${color()}`}
        onClick={() => {
          setColor(randomColor());
        }}
      >
        ■
      </button>

      <input
        ref={nametagInput}
        class="h-7 px-1"
        id="username-overlay"
        value={username()}
        oninput={() => {
          setUsername(nametagInput.value);
        }}
      />
    </div>
  );
};

const SettingsScreen = () => {
  return (
    <div class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-400">
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
    <div class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-400">
      <ColorChangerAndUsername />
      <button
        type="button"
        id="playButton"
        class="btn"
        onClick={() => {
          const player = document.getElementById('player');
          player.setAttribute('player-info', {
            name: username(),
            color: color(),
          });
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
    </div>
  );
};

const App = () => {
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
