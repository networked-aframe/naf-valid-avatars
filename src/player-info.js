/* global AFRAME NAF THREE */

const ANIMATIONS_MAN = [
  [
    'SittingIdle',
    'https://cdn.glitch.global/3e6e78f9-b796-4cf3-8451-2fcba6103a3c/SittingIdle_man.fbx?v=1711641528318', // Overdrive 40 Character Arm-Space 50
    {
      ignoreBones: [
        'Spine1',
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
    'Idle',
    'https://cdn.glitch.global/d8f22817-cf4b-44e4-9cc1-0633ac6cda8d/BreathingIdle.fbx?v=1701432248342',
    {
      ignoreBones: [
        'Spine1',
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

  [
    'Dying',
    'https://cdn.glitch.global/3e6e78f9-b796-4cf3-8451-2fcba6103a3c/Dying.fbx?v=1703867995062',
    {
      ignoreBones: ['LeftEye', 'LeftEye_end', 'LeftEye_end_end', 'RightEye', 'RightEye_end', 'RightEye_end_end'],
      positionMultiplier: 0.01,
      positionOffset: 0,
    },
  ],
];

const ANIMATIONS_WOMAN = [
  [
    'SittingIdle',
    'https://cdn.glitch.global/3e6e78f9-b796-4cf3-8451-2fcba6103a3c/SittingIdle_woman.fbx?v=1711641103935', // Overdrive 40 Character Arm-Space 62
    {
      ignoreBones: [
        'Spine1',
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
    'Idle',
    'https://cdn.glitch.global/d8f22817-cf4b-44e4-9cc1-0633ac6cda8d/BreathingIdle.fbx?v=1701432248342',
    {
      ignoreBones: [
        'Spine1',
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

  [
    'Dying',
    'https://cdn.glitch.global/3e6e78f9-b796-4cf3-8451-2fcba6103a3c/Dying.fbx?v=1703867995062',
    {
      ignoreBones: ['LeftEye', 'LeftEye_end', 'LeftEye_end_end', 'RightEye', 'RightEye_end', 'RightEye_end_end'],
      positionMultiplier: 0.01,
      positionOffset: 0,
    },
  ],
];

// const asianModel = 'https://cdn.jsdelivr.net/gh/c-frame/valid-avatars-glb@c539a28/avatars/Asian/Asian_F_1_Busi.glb';
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

const y180Quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

const truncate = (num) => Math.round(num * 100) / 100;

// To sync head in VR
AFRAME.registerComponent('avatar-bones', {
  schema: {
    // Neck: { type: 'vec4' },
    Head: { type: 'vec4' },
  },
  init: function () {
    const MODE_LERP = 0;
    if (this.el.id !== 'rig') {
      // this.neckBuffer = new NAF.InterpolationBuffer(MODE_LERP, 0.1);
      this.headBuffer = new NAF.InterpolationBuffer(MODE_LERP, 0.1);
    }
    this.localEuler = new THREE.Euler();
    this.localQuaternion = new THREE.Quaternion();
    this.localQuaternion2 = new THREE.Quaternion();
    this.localQuaternion3 = new THREE.Quaternion();
    this.tmpQuaternion = new THREE.Quaternion();
    this.transitionQuaternionStart = new THREE.Quaternion();
    this.transitionQuaternionEnd = new THREE.Quaternion();
    this.prevTime = 0;
    this.transitionProgress = 1;
  },
  events: {
    'model-loaded': function () {
      // If we switch the avatar, reset mesh to retrieve the bones of the new avatar
      queueMicrotask(() => {
        // Execute this after the model-loaded listener from player-info
        this.mesh = this.el.components['player-info'].mesh;
        if (this.mesh) {
          const bones = this.mesh.skeleton.bones;
          this.hips = getBoneByName('Hips', bones);
          this.spine = getBoneByName('Spine', bones);
          this.spine1 = getBoneByName('Spine1', bones);
          this.spine2 = getBoneByName('Spine2', bones);
          this.neck = getBoneByName('Neck', bones);
          this.head = getBoneByName('Head', bones);
          // this.mesh.skeleton.pose();
          // save quaternion of some bones of the default pose before an animation is played on the avatar
          this.spine1quaternion = new THREE.Quaternion().copy(this.spine1.quaternion);
          this.spine2quaternion = new THREE.Quaternion().copy(this.spine2.quaternion);
          this.neckquaternion = new THREE.Quaternion().copy(this.neck.quaternion);
        }
      });
    },
  },
  update: function (oldData) {
    if (this.el.id === 'rig') {
      // if (this.neck) this.neck.quaternion.copy(this.data.Neck);
      // if (this.head) this.neck.quaternion.copy(this.data.Head);
    } else {
      // this.neckBuffer.setQuaternion(this.data.Neck);
      this.headBuffer.setQuaternion(this.data.Head);
    }
  },
  tick: function (time, dt) {
    if (this.el.id === 'rig') {
      if (this.head) {
        if (!this.cameraEl) {
          this.cameraEl = this.el.querySelector('.camera');
          if (!this.cameraEl) {
            console.log('No .camera found on rig children');
            return;
          }
        }

        const camera = this.cameraEl.object3D;
        const avatarQuaternion = this.el.components['player-info'].avatarEl.object3D.quaternion;
        const hmdQuaternion = this.localQuaternion.copy(camera.quaternion).multiply(y180Quaternion);

        const hmdEuler = this.localEuler.setFromQuaternion(hmdQuaternion, 'YXZ');
        hmdEuler.x = 0;
        hmdEuler.z = 0;
        const hmdXYRotation = this.localQuaternion2.setFromEuler(hmdEuler);

        const angle = avatarQuaternion.angleTo(hmdXYRotation);
        if (angle > 0.5 || time - this.prevTime > 2000) {
          // If more than 28 degrees, move the avatar, otherwise just move the head
          // avatarQuaternion.copy(hmdXYRotation);
          this.transitionProgress = 0;
          this.transitionQuaternionStart.copy(avatarQuaternion);
          this.transitionQuaternionEnd.copy(hmdXYRotation);
          this.prevTime = time;
        }

        if (this.transitionProgress < 1) {
          this.transitionProgress += dt * 0.006;
          avatarQuaternion.slerpQuaternions(
            this.transitionQuaternionStart,
            this.transitionQuaternionEnd,
            this.transitionProgress,
          );
        }

        if (this.el.components['player-info'].data.state !== 'Idle') return;

        this.spine1.quaternion.copy(this.spine1quaternion);
        this.spine2.quaternion.copy(this.spine2quaternion);
        this.neck.quaternion.copy(this.neckquaternion);

        this.head.quaternion.copy(hmdQuaternion).premultiply(this.localQuaternion3.copy(avatarQuaternion).invert());
        // x and z rotation is inversed
        const tmp = this.head.rotation.z;
        this.head.rotation.z = -this.head.rotation.x;
        this.head.rotation.x = tmp;
        this.head.rotation.y -= 0.3;
        this.head.rotation.z = Math.max(-1, Math.min(0.7, this.head.rotation.z));
        this.head.rotation.x = Math.max(-1, Math.min(1, this.head.rotation.x));
        // The networked schema will use deepEqual in defaultRequiresUpdate for the requiresNetworkUpdate function,
        // so we truncate to 0.01 decimal, this prevent sending the info every 66ms if not much changed (more or less 0.5 degrees)
        this.data.Head.x = truncate(this.head.quaternion.x);
        this.data.Head.y = truncate(this.head.quaternion.y);
        this.data.Head.z = truncate(this.head.quaternion.z);
        this.data.Head.w = truncate(this.head.quaternion.w);
      }
    } else {
      if (this.el.components['player-info'].data.state !== 'Idle') return;
      if (this.spine1) this.spine1.quaternion.copy(this.spine1quaternion);
      if (this.spine2) this.spine2.quaternion.copy(this.spine2quaternion);
      if (this.neck) this.neck.quaternion.copy(this.neckquaternion);

      // this.neckBuffer.update(dt);
      // if (this.neck) this.neck.quaternion.copy(this.neckBuffer.getQuaternion());
      this.headBuffer.update(dt);
      if (this.head) this.head.quaternion.copy(this.headBuffer.getQuaternion());
    }
  },
});

AFRAME.registerComponent('player-info', {
  dependencies: ['avatar-bones'],
  schema: {
    name: { type: 'string', default: 'anonymous' },
    color: { type: 'color', default: '#ffffff' },
    avatarSrc: { type: 'string', default: defaultModel },
    state: { type: 'string', default: 'Idle' },
    muted: { type: 'boolean', default: false },
    avatarPose: { type: 'string', default: 'stand', oneOf: ['stand', 'sit'] },
    seatRotation: { type: 'number', default: 0 },
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
    this.updatedEventDetail = { el: undefined, data: undefined, oldData: undefined };
  },

  update: function (oldData) {
    this.updatedEventDetail.data = this.data;
    this.updatedEventDetail.oldData = oldData;
    this.updatedEventDetail.el = this.el;
    this.el.sceneEl.emit('player-info-updated', this.updatedEventDetail);
    this.updatedEventDetail.data = undefined;
    this.updatedEventDetail.oldData = undefined;
    this.updatedEventDetail.el = undefined;
    // if (this.head) this.head.setAttribute('material', 'color', this.data.color);
    if (this.nametag) this.nametag.setAttribute('value', this.data.name);

    this.avatarEl = this.el.querySelector('.model');

    if (!this.avatarEl) {
      // our own avatar
      this.avatarEl = document.createElement('a-entity');
      this.el.appendChild(this.avatarEl);
      this.avatarEl.setAttribute('class', 'model');
    }
    this.avatarEl.setAttribute('shadow', '');

    this.el.object3D.rotation.order = 'YXZ';
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

    if (oldData && this.data && (oldData.state !== this.data.state || oldData.avatarPose !== this.data.avatarPose)) {
      this.setAnimationFromState();
    }
  },

  tick: function (t) {
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
    let clip = this.data.state;
    if (this.data.state === 'Idle') {
      clip = this.data.avatarPose === 'sit' ? 'SittingIdle' : 'Idle';
    }

    this.setAnimation(`clip:${clip};loop:repeat`);
  },

  getAnimationMixer: function () {
    return this.avatarEl.getAttribute('animation-mixer');
  },

  removeAnimationMixer: function () {
    this.avatarEl.removeAttribute('animation-mixer');
    this.mixer = null;
  },

  positionChanged() {
    if (this.el.sceneEl.systems.waypoint?.occupyWaypoint) {
      this.el.sceneEl.systems.waypoint.unoccupyWaypoint();
    }

    if (this.mixer) {
      clearTimeout(this.revertToIdleTimeout);
      this.revertToIdleTimeout = setTimeout(() => {
        this.el.setAttribute('player-info', 'state', 'Idle');
      }, 100);
      this.el.setAttribute('player-info', 'state', 'Walking');
    }
  },

  events: {
    // from blink-controls
    teleported: function (evt) {
      this.positionChanged();
    },
    // from movement-controls
    moved: function (evt) {
      this.positionChanged();
    },
    // from cursor-teleport
    'navigation-start': function (evt) {
      if (this.el.sceneEl.systems.waypoint?.occupyWaypoint) {
        this.el.sceneEl.systems.waypoint.unoccupyWaypoint();
      }

      if (this.el.hasAttribute('simple-navmesh-constraint')) {
        this.el.setAttribute('simple-navmesh-constraint', 'enabled', false);
      }

      this.el.setAttribute('player-info', 'state', 'Walking');
    },
    'navigation-end': function (evt) {
      if (this.el.hasAttribute('simple-navmesh-constraint')) {
        this.el.setAttribute('simple-navmesh-constraint', 'enabled', true);
      }

      this.el.setAttribute('player-info', 'state', 'Idle');
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
      this.avatarEl.object3D.traverse((obj) => {
        if (obj.isMesh) {
          obj.frustumCulled = false;
        }
      });

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
        model.animations = Array.from(animationsCache[cacheKey].animations);
        this.setAnimationFromState();
        this.mixer = this.getAnimationMixer();
      };
      const isWoman = this.data.avatarSrc.indexOf('_F_') > -1;
      const cacheKey = `valid-${isWoman}`;
      animationsCache[cacheKey] = animationsCache[cacheKey] || {};
      if (animationsCache[cacheKey].animations) {
        callback();
        return;
      }

      if (!animationsCache[cacheKey].promise) {
        const promise = new Promise((resolve, reject) => {
          (async () => {
            const animations = isWoman ? ANIMATIONS_WOMAN : ANIMATIONS_MAN;
            const convertedAnimations = [];
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
              convertedAnimations.push(newClip);
              console.log('animation after conversion', newClip);
            }

            animationsCache[cacheKey].animations = convertedAnimations;
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
