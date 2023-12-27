/* global AFRAME NAF THREE */

const ANIMATIONS_MAN = [
  [
    'Idle',
    'https://cdn.glitch.global/d8f22817-cf4b-44e4-9cc1-0633ac6cda8d/BreathingIdle.fbx?v=1701432248342',
    {
      // quatOffsets: getQuatOffsetsFromEulers({ Neck: [3, 4, 0] }), // add small rotation right down on Neck so that idle animation look at me and not the ground
      quatOffsets: getQuatOffsetsFromEulers({ Neck: [-1, 0, 4] }), // 2nd value positive tilt right, 3rd value positive move head back
      ignoreBones: [
        'Spine2',
        'LeftEye',
        'LeftEye_end',
        'LeftEye_end_end',
        'RightEye',
        'RightEye_end',
        'RightEye_end_end',
      ],
      positionMultiplier: 0.01,
      positionOffset: -0.1,
    },
  ],

  [
    'IdleIgnoreNeck',
    'https://cdn.glitch.global/d8f22817-cf4b-44e4-9cc1-0633ac6cda8d/BreathingIdle.fbx?v=1701432248342',
    {
      // ignoreBones: ["Spine1", "Spine2", "Neck", "Head"],
      ignoreBones: [
        'Spine2',
        'Neck',
        'Head',
        'LeftEye',
        'LeftEye_end',
        'LeftEye_end_end',
        'RightEye',
        'RightEye_end',
        'RightEye_end_end',
      ],
      positionMultiplier: 0.01,
      positionOffset: -0.1,
    },
  ],

  [
    'Walking',
    'https://cdn.glitch.global/d8f22817-cf4b-44e4-9cc1-0633ac6cda8d/Walking.fbx?v=1701432532423',
    {
      ignoreBones: ['LeftEye', 'LeftEye_end', 'LeftEye_end_end', 'RightEye', 'RightEye_end', 'RightEye_end_end'],
      positionMultiplier: 0.01,
      positionOffset: -0.1,
      removeHipsForwardAnimation: true,
    },
  ],
];

const ANIMATIONS_WOMAN = [
  [
    'Idle',
    'https://cdn.glitch.global/d8f22817-cf4b-44e4-9cc1-0633ac6cda8d/BreathingIdle.fbx?v=1701432248342',
    {
      // quatOffsets: getQuatOffsetsFromEulers({ Neck: [3, 4, 0] }), // add small rotation right down on Neck so that idle animation look at me and not the ground
      quatOffsets: getQuatOffsetsFromEulers({ Neck: [-1, 0, 4] }), // 2nd value positive tilt right, 3rd value positive move head back
      ignoreBones: [
        'Spine2',
        'LeftEye',
        'LeftEye_end',
        'LeftEye_end_end',
        'RightEye',
        'RightEye_end',
        'RightEye_end_end',
      ],
      positionMultiplier: 0.01,
      positionOffset: -0.168,
    },
  ],

  [
    'IdleIgnoreNeck',
    'https://cdn.glitch.global/d8f22817-cf4b-44e4-9cc1-0633ac6cda8d/BreathingIdle.fbx?v=1701432248342',
    {
      // ignoreBones: ["Spine1", "Spine2", "Neck", "Head"],
      ignoreBones: [
        'Spine2',
        'Neck',
        'Head',
        'LeftEye',
        'LeftEye_end',
        'LeftEye_end_end',
        'RightEye',
        'RightEye_end',
        'RightEye_end_end',
      ],
      positionMultiplier: 0.01,
      positionOffset: -0.168,
    },
  ],

  [
    'Walking',
    'https://cdn.glitch.global/d8f22817-cf4b-44e4-9cc1-0633ac6cda8d/Walking.fbx?v=1701432532423',
    {
      ignoreBones: ['LeftEye', 'LeftEye_end', 'LeftEye_end_end', 'RightEye', 'RightEye_end', 'RightEye_end_end'],
      positionMultiplier: 0.01,
      positionOffset: -0.168,
      removeHipsForwardAnimation: true,
    },
  ],
];

// const asianModel = 'https://cdn.jsdelivr.net/gh/c-frame/valid-avatars-glb@489c8aa/avatars/Asian/Asian_F_1_Busi.glb';
// const defaultModel = asianModel;
const defaultModel = ''; // none, set via the UI
const animationsCache = {};

// Temporary workaround for template declaration; see issue 167
NAF.schemas.getComponentsOriginal = NAF.schemas.getComponents;
NAF.schemas.getComponents = (template) => {
  if (!NAF.schemas.hasTemplate('#avatar-template')) {
    NAF.schemas.add({
      template: '#avatar-template',
      components: [
        'avatar-bones',
        'player-info',
        {
          component: 'position',
          requiresNetworkUpdate: NAF.utils.vectorRequiresUpdate(0.001),
        },
        {
          component: 'rotation',
          requiresNetworkUpdate: NAF.utils.vectorRequiresUpdate(0.5),
        },
        {
          selector: '.model',
          component: 'rotation',
          requiresNetworkUpdate: NAF.utils.vectorRequiresUpdate(0.5),
        },
      ],
    });
  }

  const components = NAF.schemas.getComponentsOriginal(template);
  return components;
};

// To sync head in VR
AFRAME.registerComponent('avatar-bones', {});

AFRAME.registerComponent('player-info', {
  dependencies: ['avatar-bones'],
  schema: {
    name: { type: 'string', default: 'anonymous' },
    color: { type: 'color', default: '#ffffff' },
    avatarSrc: { type: 'string', default: defaultModel },
    state: { type: 'string', default: 'Idle' },
  },

  init: function () {
    // this.head = this.el.querySelector('.head');
    this.nametag = this.el.querySelector('.nametag');
    this.setAnimation = this.setAnimation.bind(this);
    this.setAnimationFromState = this.setAnimationFromState.bind(this);
    this.getAnimationMixer = this.getAnimationMixer.bind(this);
    this.removeAnimationMixer = this.removeAnimationMixer.bind(this);
    this.positionChanged = this.positionChanged.bind(this);
    this.fbxLoader = new THREE.FBXLoader();
    this.glbLoader = new THREE.GLTFLoader();
  },

  update: function (oldData) {
    // if (this.head) this.head.setAttribute('material', 'color', this.data.color);
    if (this.nametag) this.nametag.setAttribute('value', this.data.name);

    this.cameraEl = this.el.querySelector('.camera');
    this.avatarEl = this.el.querySelector('.model');

    if (!this.avatarEl) {
      // our own avatar
      this.avatarEl = document.createElement('a-entity');
      this.el.appendChild(this.avatarEl);
      this.avatarEl.setAttribute('class', 'model');
    }
    this.avatarEl.setAttribute('shadow', '');

    this.el.object3D.rotation.order = 'YXZ';
    this.cameraEl.object3D.rotation.order = 'YXZ';
    this.avatarEl.object3D.rotation.order = 'YXZ';

    if (oldData && this.data.avatarSrc && oldData.avatarSrc && this.data.avatarSrc !== oldData.avatarSrc) {
      this.mesh = undefined;
      // avatar-animation-mixer component references previous loaded model, remove it, it will be recreated in model-loaded
      this.removeAnimationMixer();
    }
    if (this.data.avatarSrc) {
      this.avatarEl.setAttribute('gltf-model', this.data.avatarSrc);
    }

    if (!this.mesh || !this.mixer) {
      return;
    }

    if (oldData && this.data && oldData.state !== this.data.state) {
      this.setAnimationFromState();
    }
  },

  tick: function (t) {
    if (this.el.id === 'rig' && this.cameraEl && this.avatarEl) {
      const cameraRot = this.cameraEl.object3D.rotation;
      this.avatarEl.object3D.rotation.set(0, cameraRot.y + Math.PI, 0);
    }
    if (this.mesh) {
      const morphTargetDictionary = this.mesh.morphTargetDictionary;
      if (t % 6000 < 500) {
        // every 6s
        this.startBlinking = true;
      }
      const valueQuick = (Math.sin(t / 100) + 1) / 2; // 0-1
      if (valueQuick < 0.3) {
        this.startBlinking = false;
        this.mesh.morphTargetInfluences[morphTargetDictionary['h_expressions.ReyeClose_h']] = 0;
        this.mesh.morphTargetInfluences[morphTargetDictionary['h_expressions.LeyeClose_h']] = 0;
      }
      if (this.startBlinking) {
        this.mesh.morphTargetInfluences[morphTargetDictionary['h_expressions.ReyeClose_h']] = valueQuick;
        this.mesh.morphTargetInfluences[morphTargetDictionary['h_expressions.LeyeClose_h']] = valueQuick;
      }
    }
  },

  setAnimation: function (props) {
    this.avatarEl.setAttribute('animation-mixer', props);
  },

  setAnimationFromState() {
    this.setAnimation(`clip:${this.data.state};loop:repeat`);
  },

  getAnimationMixer: function () {
    return this.avatarEl.getAttribute('animation-mixer');
  },

  removeAnimationMixer: function () {
    this.avatarEl.removeAttribute('animation-mixer');
    this.mixer = null;
  },

  positionChanged() {
    if (this.mixer) {
      clearTimeout(this.revertToIdleTimeout);
      this.revertToIdleTimeout = setTimeout(() => {
        this.el.setAttribute('player-info', 'state', 'Idle');
      }, 100);
      this.el.setAttribute('player-info', 'state', 'Walking');
    }
  },

  events: {
    teleported: function (evt) {
      // from blink-controls
      this.positionChanged();
    },
    moved: function (evt) {
      // from movement-controls
      this.positionChanged();
    },
    'model-loaded': function (evt) {
      if (this.el.id === 'rig') {
        // Hide my own avatar
        // this.avatarEl.object3D.visible = false;
        this.avatarEl.object3D.traverse((obj) => {
          if (!obj.layers) return;
          obj.layers.disableAll();
          obj.layers.enable(3);
        });
      }

      const model = evt.detail.model;
      // Original fbx avatar has master->Reference->H_DDS_HighRes
      // meshoptimized glb avatar has Scene->H_DDS_HighRes, so we rename Scene to Armature and
      // map Reference to Armature when converting the animations, also ignoring the master.quaternion track that doesn't seem to do anything.
      model.name = 'Armature';
      this.mesh = model.getObjectByName('H_DDS_HighRes');
      if (!this.mesh) return;
      // window.mesh = this.mesh;
      // window.model = model;

      const callback = () => {
        this.setAnimationFromState();
        this.mixer = this.getAnimationMixer();
      };
      const isWoman = this.data.avatarSrc.indexOf('_F_') > -1;
      const cacheKey = `valid-${isWoman}`;
      animationsCache[cacheKey] = animationsCache[cacheKey] || {};
      if (animationsCache[cacheKey].animations) {
        model.animations = Array.from(animationsCache[cacheKey].animations);
        callback();
        return;
      }

      if (!animationsCache[cacheKey].promise) {
        const promise = new Promise((resolve, reject) => {
          (async () => {
            const animations = isWoman ? ANIMATIONS_WOMAN : ANIMATIONS_MAN;
            for (let [animationName, url, options] of animations) {
              const loader = url.indexOf('.glb') > -1 ? this.glbLoader : this.fbxLoader;
              options = options ?? {};
              const asset = await loader.loadAsync(url);
              const clip = asset.animations[0];
              let newClip = clip;
              clip.name = animationName;
              newClip = simpleRetargetClip(this.mesh, clip, {
                hip: 'Hips',
                names: { Reference: 'Armature' },
                offsets: options.quatOffsets ?? {},
                positionMultiplier: options.positionMultiplier ?? 1.0,
                positionOffset: options.positionOffset ?? 0,
                ignoreBones: options.ignoreBones ?? [],
                removeHipsForwardAnimation: options.removeHipsForwardAnimation ?? false,
              });
              console.log('retargeted', clip.name, 'renamed to', animationName);
              model.animations.push(newClip);
              console.log('animation after conversion', newClip);
            }

            animationsCache[cacheKey].animations = Array.from(model.animations);
            resolve();
          })();
        });
        animationsCache[cacheKey].promise = promise;
      }
      animationsCache[cacheKey].promise.then(callback).catch(() => {
        console.error('Error loading the animations');
      });
    },
  },
});

function getBones(skeleton) {
  return Array.isArray(skeleton) ? skeleton : skeleton.bones;
}

function getBoneByName(name, skeleton) {
  for (let i = 0, bones = getBones(skeleton); i < bones.length; i++) {
    if (name === bones[i].name) return bones[i];
  }
}

function simpleRetargetClip(target, clip, options = {}) {
  const names = options.names ?? {};
  const offsets = options.offsets ?? {};
  const positionMultiplier = options.positionMultiplier ?? 1.0;
  const inverseBones = options.inverseBones ?? false;
  const ignoreBones = options.ignoreBones ?? [];
  const removeHipsForwardAnimation = options.removeHipsForwardAnimation ?? false;
  const positionOffset = options.positionOffset ?? 0;
  const tracks = [];
  const quat = new THREE.Quaternion();

  clip.tracks.forEach((track) => {
    const trackSplitted = track.name.split('.');
    const mixamoRigName = trackSplitted[0];
    const boneName = names[mixamoRigName] || mixamoRigName;
    const propertyName = trackSplitted[1];
    const boneTo = getBoneByName(boneName, target.skeleton);
    if (!boneTo && boneName !== 'Armature') return;
    if (ignoreBones.indexOf(boneName) > -1) {
      console.log(clip.name, 'ignore track', boneName);
      return;
    }

    if (track instanceof THREE.VectorKeyframeTrack && track.name.endsWith('position') && options.hip === boneName) {
      const threetrack = new THREE.VectorKeyframeTrack(
        `${boneName}.${propertyName}`,
        track.times,
        track.values.map((v, i) => {
          v = v * positionMultiplier;
          if (removeHipsForwardAnimation && i % 3 === 1) {
            v = 0;
          }
          if (positionOffset !== 0 && i % 3 === 2) {
            v += positionOffset;
          }
          return v;
        }),
      );
      tracks.push(threetrack);
    } else if (track instanceof THREE.QuaternionKeyframeTrack) {
      const times = track.times;
      const values = track.values.map((v, i) => (inverseBones && i % 2 === 0 ? -v : v));
      const offset = offsets[boneName];
      if (offset) {
        const numFrames = track.values.length / 4;
        for (let i = 0; i < numFrames; ++i) {
          quat.fromArray(values, i * 4);
          quat.multiply(offset);
          quat.toArray(values, i * 4);
        }
      }

      const threetrack = new THREE.QuaternionKeyframeTrack(`${boneName}.${propertyName}`, times, values);
      tracks.push(threetrack);
    }
  });

  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

function getQuatOffsetsFromEulers(rotations) {
  const offsets = {};
  for (const [boneName, rotation] of Object.entries(rotations)) {
    offsets[boneName] = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        rotation[0] * THREE.MathUtils.DEG2RAD,
        rotation[1] * THREE.MathUtils.DEG2RAD,
        rotation[2] * THREE.MathUtils.DEG2RAD,
      ),
    );
  }
  return offsets;
}
