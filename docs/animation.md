# Create an animation from mixamo

- Go to https://www.mixamo.com and sign up
- Click on "Upload Character" button
- Drag and drop the avatar model in fbx format, for example
  [Asian_F_1_Busi.fbx](https://github.com/xrtlab/Validated-Avatar-Library-for-Inclusion-and-Diversity---VALID/blob/main/Avatars/Asian/Asian_F_1_Busi.fbx)
- Search and select an animation, for example Dying
- Tweak some parameters of the animation if you want
- Click on "Download" button, keep "Format" on "FBX Binary" and "Frames per Second" on "30",
  for "Skin" select "Without Skin", and for "Keyframe Reduction" select "uniform".
- Save the file, for example Dying.fbx

See the steps in video:
https://github.com/networked-aframe/naf-valid-avatars/assets/112249/be7cf088-76b6-4c9d-b303-5efe610605b5

# Using the animation

- Upload on glitch as an asset

Put the animation in the ANIMATIONS array in the `player-info.js` file.

```js
  [
    'Dying',
    'https://cdn.glitch.global/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/Dying.fbx?v=1701432248342',
    {
      ignoreBones: ['LeftEye', 'LeftEye_end', 'LeftEye_end_end', 'RightEye', 'RightEye_end', 'RightEye_end_end'],
      positionMultiplier: 0.01,
      positionOffset: 0,
    },
  ],
```

Most of the animation on mixamo seems to be scaled by 100, so you will need
`positionMultiplier` set to `0.01`.
If the feet are not on the ground, you can adjust `positionOffset: -0.1`.

To play the animation:

```js
document.getElementById('rig').setAttribute('player-info', 'state', 'Dying');
```
