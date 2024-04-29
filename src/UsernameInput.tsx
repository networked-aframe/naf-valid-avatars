/* global THREE */
import { Component, Show, createEffect, createSignal, onMount } from 'solid-js';

const randomColor = () => {
  // @ts-ignore
  return '#' + new THREE.Color(Math.random(), Math.random(), Math.random()).getHexString();
};

export const [username, setUsername] = createSignal('user-' + Math.round(Math.random() * 10000));
export const [color, setColor] = createSignal(randomColor());

const [domContentLoaded, setDomContentLoaded] = createSignal(false);

document.addEventListener('DOMContentLoaded', () => {
  setDomContentLoaded(true);
});

interface Props {
  enableColorPicker?: boolean;
  entity?: string;
}

export const UsernameInput: Component<Props> = (props) => {
  onMount(() => {
    const savedName = localStorage.getItem('username');
    if (savedName) {
      setUsername(savedName);
    }

    const savedColor = localStorage.getItem('color');
    if (savedColor) {
      setColor(savedColor);
    }
  });

  createEffect(() => {
    localStorage.setItem('username', username());
    localStorage.setItem('color', color());
    if (!domContentLoaded()) return;
    const info = {
      name: username(),
      color: color(),
    };
    // @ts-ignore
    document.querySelector(props.entity ?? '#player')?.setAttribute('player-info', info);
  });

  return (
    <div class="flex flex-row items-center">
      <input
        id="username"
        type="text"
        class="form-input h-7 px-1"
        value={username()}
        oninput={(e: any) => {
          setUsername(e.target.value);
        }}
      />
      <Show when={props.enableColorPicker ?? true}>
        <input
          id="avatarcolor"
          type="color"
          title="Pick a color for your avatar"
          class="h-7 w-7"
          value={color()}
          onchange={(e: any) => {
            setColor(e.target.value);
          }}
        />
      </Show>
    </div>
  );
};
