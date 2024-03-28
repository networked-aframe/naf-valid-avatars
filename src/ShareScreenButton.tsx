/* global AFRAME NAF */
import { Component, createMemo, createSignal, Show } from 'solid-js';
import { TbScreenShare, TbScreenShareOff } from 'solid-icons/tb';
import { BsCameraVideo, BsCameraVideoOff } from 'solid-icons/bs';

const audioConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const showAlertDialog = (body: string, title: string) => {
  console.error(body, title);
};

let currentVideoShareEntity: null | HTMLElement = null;
let isHandlingVideoShare = false;

interface VideoConstraints {
  mediaSource?: string;
  width?: {
    max?: number;
    ideal?: number;
  };
  height?: {
    max?: number;
    ideal?: number;
  };
  frameRate?: number;
}

interface AudioContraints {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export const shareVideoMediaStream = async (
  mediaFrameId: string,
  constraints: { video: VideoConstraints; audio?: AudioContraints },
  isDisplayMedia = false,
) => {
  // @ts-ignore
  const scene = AFRAME.scenes[0];
  const audioSystem = scene.systems.audio;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent); // may also be Chrome on iOS!
  const title = isDisplayMedia ? 'Failed to share the screen' : 'Failed to share the camera';
  if (
    isDisplayMedia &&
    (typeof navigator.mediaDevices === 'undefined' || typeof navigator.mediaDevices.getDisplayMedia === 'undefined')
  ) {
    // On Safari only, showAlert doesn't work here because we still have an active modal?
    window.alert("Sorry, screen share doesn't work on mobile.");
    return;
  }
  if (currentVideoShareEntity) {
    await endVideoSharing();
  }
  if (isHandlingVideoShare) return;
  isHandlingVideoShare = true;

  let newStream;

  try {
    if (isDisplayMedia) {
      newStream = await navigator.mediaDevices.getDisplayMedia(constraints);
    } else {
      newStream = await navigator.mediaDevices.getUserMedia(constraints);
    }
    // @ts-ignore
  } catch (e: Error) {
    if (e.name === 'NotAllowedError') {
      let msg = 'Please verify sharing the screen or camera is allowed in the permissions.';
      if (!isSafari) {
        msg += ' Click on the lock icon in the url bar to see the allowed permissions.';
      }
      // @ts-ignore
      if (AFRAME.utils.device.isMobile()) {
        if (isDisplayMedia) {
          showAlertDialog("Sorry, screen share doesn't work on mobile.", title);
        } else {
          showAlertDialog(msg, title);
        }
      } else {
        if (e.message === 'Permission denied by system') {
          showAlertDialog(
            'The browser returned the following error: Permission denied by system. Are you using Chrome on macOS? Sharing a Chrome tab should work. If you want to share your screen or a window, please go to System Preferences > Security & Privacy > Privacy > Camera & Microphone, and make sure Chrome is listed and has a checkbox.',
            title,
          );
        } else {
          showAlertDialog(msg, title);
        }
      }
    } else {
      console.error(e);
      showAlertDialog(
        'The browser returned the following error: ' + e.name + ': ' + e.message,
        'Failed to share the screen or camera',
      );
    }
    isHandlingVideoShare = false;
    scene.emit('share_video_failed');
    return;
  }

  // @ts-ignore
  const mediaStream = audioSystem.outboundStream;
  const videoTracks = newStream ? newStream.getVideoTracks() : [];
  if (videoTracks.length > 0) {
    videoTracks.forEach((track) => {
      mediaStream.addTrack(track);
      track.onended = () => {
        scene.emit('action_end_video_sharing');
      };
    });

    if (newStream && newStream.getAudioTracks().length > 0) {
      // @ts-ignore
      audioSystem.addStreamToOutboundAudio('screenshare', newStream);
    }

    // @ts-ignore
    await NAF.connection.adapter?.setLocalMediaStream(mediaStream);
    const mediaFrameSystem = scene.systems['media-frame'];
    // @ts-ignore
    currentVideoShareEntity = mediaFrameSystem.getMediaFrameById(mediaFrameId);

    if (currentVideoShareEntity) {
      // @ts-ignore
      currentVideoShareEntity.setAttribute('video-texture-target', {
        src: `naf://clients/${NAF.clientId}/video`,
      });
    }

    scene.emit('share_video_enabled', {
      source: isDisplayMedia ? 'screen' : 'camera',
      mediaFrameId: mediaFrameId,
    });
  } else {
    scene.emit('share_video_failed', { message: 'No video track' });
  }

  isHandlingVideoShare = false;
};

export const shareCamera = (mediaFrameId: string) => {
  // @ts-ignore
  const constraints = {
    video: {
      mediaSource: 'camera',
      width: { max: 1280, ideal: 640 },
      height: { ideal: 360 },
      frameRate: 30,
    },
  };
  shareVideoMediaStream(mediaFrameId, constraints);
};

export const shareScreen = (mediaFrameId: string) => {
  // @ts-ignore
  const constraints = {
    video: {
      width: { max: 1600 },
      height: { max: 900 },
    },
    audio: audioConstraints,
  };
  shareVideoMediaStream(mediaFrameId, constraints, true);
};

export const endVideoSharing = async () => {
  if (isHandlingVideoShare) return;
  isHandlingVideoShare = true;

  // @ts-ignore
  const scene = AFRAME.scenes[0];
  const audioSystem = scene.systems.audio;
  // @ts-ignore
  const mediaStream = audioSystem.outboundStream;
  for (const track of mediaStream.getVideoTracks()) {
    track.onended = null;
    track.stop(); // Stop video track to remove the "Stop screen sharing" bar right away.
    // For tab sharing with audio, the audio track also needs to be stopped, this is done audioSystem.removeStreamFromOutboundAudio
    mediaStream.removeTrack(track);
  }

  // @ts-ignore
  audioSystem.removeStreamFromOutboundAudio('screenshare');

  // @ts-ignore
  await NAF.connection.adapter?.setLocalMediaStream(mediaStream);
  currentVideoShareEntity = null;

  scene.emit('share_video_disabled');
  isHandlingVideoShare = false;
};

export const [shareScreenIconEnabled, setShareScreenIconEnabled] = createSignal(false);
export const [shareCameraIconEnabled, setShareCameraIconEnabled] = createSignal(false);

export const ShareScreenButton: Component = () => {
  const title = createMemo(() => {
    if (!shareScreenIconEnabled()) {
      return 'Share screen';
    } else {
      return 'Stop sharing screen';
    }
  });

  return (
    <button
      class="btn-rounded btn-secondary"
      classList={{ active: shareScreenIconEnabled() }}
      onClick={() => {
        const enabled = shareScreenIconEnabled();
        if (enabled) {
          // @ts-ignore
          endVideoSharing();
        } else {
          // @ts-ignore
          const mediaFrameSystem = AFRAME.scenes[0].systems['media-frame'];
          // @ts-ignore
          const mediaFrame = mediaFrameSystem.getClosestMediaFrame('video');
          if (mediaFrame) {
            shareScreen(mediaFrame.id);
          } else {
            // TODO spawn a plane
          }
        }
        // @ts-ignore
        document.activeElement.blur();
        document.body.focus();
      }}
      title={title()}
    >
      <Show when={shareScreenIconEnabled()}>
        <TbScreenShare size={24} />
      </Show>
      <Show when={!shareScreenIconEnabled()}>
        <TbScreenShareOff size={24} />
      </Show>
    </button>
  );
};

export const ShareCameraButton: Component = () => {
  const title = createMemo(() => {
    if (!shareCameraIconEnabled()) {
      return 'Share camera';
    } else {
      return 'Stop sharing camera';
    }
  });

  return (
    <button
      class="btn-rounded btn-secondary"
      classList={{ active: shareCameraIconEnabled() }}
      onClick={() => {
        const enabled = shareCameraIconEnabled();
        if (enabled) {
          // @ts-ignore
          endVideoSharing();
        } else {
          // @ts-ignore
          const mediaFrameSystem = AFRAME.scenes[0].systems['media-frame'];
          // @ts-ignore
          const mediaFrame = mediaFrameSystem.getClosestMediaFrame();
          if (mediaFrame) {
            shareCamera(mediaFrame.id);
          }
        }
        // @ts-ignore
        document.activeElement.blur();
        document.body.focus();
      }}
      title={title()}
    >
      <Show when={shareCameraIconEnabled()}>
        <BsCameraVideo size={24} />
      </Show>
      <Show when={!shareCameraIconEnabled()}>
        <BsCameraVideoOff size={24} />
      </Show>
    </button>
  );
};
