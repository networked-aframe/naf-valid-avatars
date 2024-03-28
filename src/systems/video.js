/* global AFRAME */
import {
  shareCamera,
  shareScreen,
  setShareCameraIconEnabled,
  setShareScreenIconEnabled,
  endVideoSharing,
} from '../ShareScreenButton';

function eventsBind(component, events) {
  for (const eventName in events) {
    component.events[eventName] = events[eventName].bind(component);
  }
}

AFRAME.registerSystem('video', {
  init() {
    eventsBind(this, this.events);
    this.eventsAttach();
  },

  /**
   * Attach events from component-defined events map.
   */
  eventsAttach: function () {
    // Safety detach to prevent double-registration.
    this.eventsDetach();
    for (const eventName in this.events) {
      this.el.addEventListener(eventName, this.events[eventName]);
    }
  },

  /**
   * Detach events from component-defined events map.
   */
  eventsDetach: function () {
    for (const eventName in this.events) {
      this.el.removeEventListener(eventName, this.events[eventName]);
    }
  },

  events: {
    action_share_camera: (evt) => {
      const mediaFrameId = evt.detail.el.id;
      shareCamera(mediaFrameId);
    },
    action_share_screen: (evt) => {
      const mediaFrameId = evt.detail.el.id;
      shareScreen(mediaFrameId);
    },
    action_end_video_sharing: endVideoSharing,
    // @ts-ignore
    share_video_enabled: (evt) => {
      console.log('share video enabled', evt);
      if (evt.detail.source === 'camera') {
        setShareCameraIconEnabled(true);
      }
      if (evt.detail.source === 'screen') {
        setShareScreenIconEnabled(true);
      }
    },
    share_video_disabled: () => {
      setShareCameraIconEnabled(false);
      setShareScreenIconEnabled(false);
    },
    share_video_failed: () => {},
  },
  play() {
    // This is never executed
  },
  pause() {
    // This is never executed
    // There is no way to properly remove listeners when removing the system or scene
  },
});
