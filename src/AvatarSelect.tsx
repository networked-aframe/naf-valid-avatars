import { Component, For, Show, createEffect, createSignal } from 'solid-js';
import { avatarSrc, avatarsBaseUrl, setAvatarSrc } from './ui';

interface Avatar {
  text: string;
  image: string;
  model: string;
  ethnicity: string;
  gender: string;
  num: string;
  outfit: string;
}

interface Props {
  avatars: Avatar[];
}

export const [gender, setGender] = createSignal('F');
export const [outfit, setOutfit] = createSignal('Casual');

export const AvatarSelect: Component<Props> = (props) => {
  createEffect(() => {
    if (avatarSrc()) {
      const idx = props.avatars.findIndex((avatar) => avatarSrc().endsWith(avatar.model));
      if (idx === -1) return;
      const id = `avatar-${idx}`;
      const el = document.getElementById(id);
      el?.scrollIntoView();
    }
  });

  return (
    <>
      <label class="font-bold">Your avatar</label>

      <label>Gender</label>
      <div class="flex items-center gap-6">
        <label class="flex items-center gap-2">
          <input type="radio" checked={gender() === 'F'} name="gender" value="F" onClick={() => setGender('F')} />
          <span>Female</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="radio" checked={gender() === 'M'} name="gender" value="M" onClick={() => setGender('M')} />
          <span>Male</span>
        </label>
      </div>

      <label>Outfit</label>
      <div class="flex items-center gap-6">
        <label class="flex items-center gap-2">
          <input
            type="radio"
            checked={outfit() === 'Casual'}
            name="outfit"
            value="Casual"
            onClick={() => setOutfit('Casual')}
          />
          <span>Casual</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            checked={outfit() === 'Busi'}
            name="outfit"
            value="Busi"
            onClick={() => setOutfit('Busi')}
          />
          <span>Business</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            checked={outfit() === 'Medi'}
            name="outfit"
            value="Medi"
            onClick={() => setOutfit('Medi')}
          />
          <span>Medical</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            checked={outfit() === 'Milit'}
            name="outfit"
            value="Milit"
            onClick={() => setOutfit('Milit')}
          />
          <span>Military</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            checked={outfit() === 'Util'}
            name="outfit"
            value="Util"
            onClick={() => setOutfit('Util')}
          />
          <span>Utility</span>
        </label>
      </div>

      <div class="flex h-52 w-[800px] flex-row flex-nowrap gap-2 overflow-y-hidden overflow-x-scroll">
        <For each={props.avatars}>
          {(avatar, idx) => (
            <Show when={avatar.gender === gender() && avatar.outfit === outfit()}>
              <div
                id={`avatar-${idx()}`}
                class="relative h-52 w-52 shrink-0 cursor-pointer"
                onClick={() => {
                  setAvatarSrc(avatarsBaseUrl + avatar.model);
                }}
              >
                <img
                  class="absolute inset-0"
                  alt={`avatar ${avatar.text}`}
                  loading="lazy"
                  src={avatarsBaseUrl + avatar.image}
                  width="208"
                  height="208"
                />
                <div
                  class="absolute inset-0 bg-white/30 backdrop-brightness-125"
                  classList={{ hidden: avatarSrc().endsWith(avatar.model) }}
                ></div>
              </div>
            </Show>
          )}
        </For>
      </div>
    </>
  );
};