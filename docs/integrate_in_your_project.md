# Integrate the avatars in your glitch project

The main parts without the UI are in `player-info.js` and `index.html`.
You can look at `index.html` to see the exact things to add, but here are the relevant parts concerning the avatars.

Get the `player-info.js` file, upload it in a js folder next to your `index.html` file.
In your `index.html` add the following lines before `</head>`:

```html
<!--
    <script src="https://cdn.jsdelivr.net/npm/networked-aframe@0.12.1/dist/networked-aframe.min.js"></script>
    when released that expose NAF.InterpolationBuffer, for now we use a master build:
-->
<script src="https://cdn.jsdelivr.net/gh/networked-aframe/networked-aframe@47bc5c7/dist/networked-aframe.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.2.0/dist/aframe-extras.min.js"></script>
<script src="/js/player-info.js"></script>
```

Be sure to not load several versions of networked-aframe and aframe-extras.

Remove any NAF schema in `index.html` related to the avatar, the one we'll use is defined in the `player-info.js` file.

To load the avatars properly, we need meshopt support:

```html
<a-scene gltf-model="meshoptDecoderPath:https://unpkg.com/meshoptimizer@0.19.0/meshopt_decoder.js"
```

Define the `avatar-template` naf template:

```html
<template id="avatar-template">
  <a-entity player-info>
    <a-entity class="model">
      <a-text class="nametag" align="center" value="?" position="0 2.1 0" scale=".5 .5 .5"></a-text>
    </a-entity>
    <!-- <a-entity class="camera" networked-audio-source></a-entity> -->
    <a-entity class="camera"></a-entity>
  </a-entity>
</template>
```

and rig and player entities like this:

```html
<a-entity
  id="rig"
  movement-controls="fly:false;controls: gamepad, trackpad, keyboard, nipple;"
  spawn-in-circle="radius:1"
  networked="template:#avatar-template;attachTemplateToLocal:false"
  player-info
>
  <a-entity id="player" class="camera" camera position="0 1.6 0" look-controls></a-entity>
</a-entity>
```

You can create your own UI to select the avatar. To set the avatar model and name, execute the following for example:

```js
const rig = document.getElementById('rig');
rig.setAttribute('player-info', {
  name: 'John',
  avatarSrc: 'https://cdn.jsdelivr.net/gh/c-frame/valid-avatars-glb@489c8aa/avatars/Asian/Asian_F_1_Busi.glb',
});
```
