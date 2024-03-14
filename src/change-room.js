/* global AFRAME, NAF */
// MIT License

// Copyright (c) 2024 Vincent Fretin

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

let nafConfig;
let connecting = false;

AFRAME.registerComponent('change-room', {
  schema: {
    on: { type: 'string', default: 'click' },
    room: { type: 'string', default: '' },
    url: { type: 'string', default: '' },
    select: { type: 'string', default: '#scene' },
    target: { type: 'string', default: '#scene' },
  },
  init() {
    this.changeRoom = this.changeRoom.bind(this);
  },
  async changeRoom() {
    if (connecting) {
      return;
    }

    const sceneEl = this.el.sceneEl;
    const { url, select, target } = this.data;
    try {
      connecting = true;
      window.history.pushState(null, '', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const selectedContent = doc.querySelector(select);
      if (selectedContent) {
        const targetEl = document.querySelector(target);
        targetEl.outerHTML = selectedContent.outerHTML;
      } else {
        console.error(`Element ${target} not found in the fetched document.`);
      }

      if (sceneEl.getAttribute('networked-scene').room === this.data.room) {
        connecting = false;
        return;
      }

      if (!nafConfig) {
        nafConfig = { ...sceneEl.getAttribute('networked-scene'), connectOnLoad: false };
      }
      nafConfig.room = this.data.room;

      sceneEl.removeAttribute('networked-scene');
      setTimeout(() => {
        sceneEl.setAttribute('networked-scene', nafConfig);
        sceneEl.emit('connect');
        document.body.addEventListener(
          'connected',
          () => {
            connecting = false;
            const rig = document.getElementById('rig');
            rig.setAttribute('networked-aframe', { creator: NAF.clientId });
            NAF.utils.takeOwnership(rig);
          },
          { once: true },
        );
      }, 1000);
    } catch (error) {
      connecting = false;
      console.error('There has been a problem with the fetch operation:', error);
    }
  },
  play() {
    this.el.addEventListener(this.data.on, this.changeRoom);
  },
  pause() {
    this.el.removeEventListener(this.data.on, this.changeRoom);
  },
});
