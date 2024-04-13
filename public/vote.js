/* global AFRAME, NAF, THREE */

// This is unmodified https://github.com/aframevr/aframe/blob/master/examples/showcase/hand-tracking/menu.js
AFRAME.registerComponent('menu', {
  init: function () {
    var el = this.el;
    var menuBackGroundEl = document.createElement('a-entity');
    menuBackGroundEl.setAttribute('geometry', {
      primitive: 'box',
      width: 0.6,
      height: 0.2,
      depth: 0.01,
    });
    menuBackGroundEl.setAttribute('material', {
      color: 'gray',
    });
    menuBackGroundEl.setAttribute('position', '0 0 -0.025');
    el.appendChild(menuBackGroundEl);
  },
});

// This is a modified version of https://github.com/aframevr/aframe/blob/master/examples/showcase/hand-tracking/button.js
// that adds a disabled property.
AFRAME.registerComponent('button', {
  schema: {
    label: { default: 'label' },
    width: { default: 0.11 },
    disabled: { default: false },
    toggleable: { default: false },
  },
  init: function () {
    var el = this.el;
    var labelEl = (this.labelEl = document.createElement('a-entity'));

    this.color = '#3a50c5';
    el.setAttribute('geometry', {
      primitive: 'box',
      width: this.data.width,
      height: 0.05,
      depth: 0.04,
    });

    el.setAttribute('material', { color: this.color });

    labelEl.setAttribute('position', '0 0 0.02');
    labelEl.setAttribute('text', {
      value: this.data.label,
      color: 'white',
      align: 'center',
    });

    labelEl.setAttribute('scale', '0.75 0.75 0.75');
    this.el.appendChild(labelEl);

    this.bindMethods();
    this.el.addEventListener('stateadded', this.stateChanged);
    this.el.addEventListener('stateremoved', this.stateChanged);
    this.el.addEventListener('pressedstarted', this.onPressedStarted);
    this.el.addEventListener('pressedended', this.onPressedEnded);
  },

  bindMethods: function () {
    this.stateChanged = this.stateChanged.bind(this);
    this.onPressedStarted = this.onPressedStarted.bind(this);
    this.onPressedEnded = this.onPressedEnded.bind(this);
  },

  update: function (oldData) {
    if (oldData.label !== this.data.label) {
      this.labelEl.setAttribute('text', 'value', this.data.label);
    }

    const el = this.el;
    if (this.data.disabled) {
      el.removeAttribute('pressable');
      el.classList.remove('clickable');
      el.removeAttribute('hoverable');
      this.color = 'gray';
      this.stateChanged();
    } else {
      el.setAttribute('pressable', '');
      el.classList.add('clickable');
      el.setAttribute('hoverable', '');
      this.color = '#3a50c5';
      this.stateChanged();
    }
  },

  stateChanged: function () {
    var color = this.el.is('pressed') ? 'green' : this.color;
    this.el.setAttribute('material', { color: color });
  },

  onPressedStarted: function () {
    var el = this.el;
    el.setAttribute('material', { color: 'green' });
    el.emit('click');
    if (this.data.toggleable) {
      if (el.is('pressed')) {
        el.removeState('pressed');
      } else {
        el.addState('pressed');
      }
    }
  },

  onPressedEnded: function () {
    if (this.el.is('pressed')) {
      return;
    }
    this.el.setAttribute('material', { color: this.color });
  },
});

const pressableCoolDownDelay = 500;
let pressableCoolDownStartedTime = 0;

// This is https://github.com/aframevr/aframe/blob/master/examples/showcase/hand-tracking/pressable.js
// with a fix to get the indexTipPosition in world position (including the rig translation)
AFRAME.registerComponent('pressable', {
  schema: {
    pressDistance: { default: 0.06 },
  },

  init: function () {
    this.worldPosition = new THREE.Vector3();
    this.handEls = document.querySelectorAll('[hand-tracking-controls]');
    this.pressed = false;
    this.indexTipPosition = new THREE.Vector3();
  },

  tick: function (t) {
    if (t < pressableCoolDownStartedTime + pressableCoolDownDelay) return;
    var handEls = this.handEls;
    var handEl;
    var distance;
    for (var i = 0; i < handEls.length; i++) {
      handEl = handEls[i];
      this.indexTipPosition.copy(handEl.components['hand-tracking-controls'].indexTipPosition);
      handEl.object3D.parent.updateMatrixWorld();
      handEl.object3D.parent.localToWorld(this.indexTipPosition);
      distance = this.calculateFingerDistance(this.indexTipPosition);
      if (distance < this.data.pressDistance) {
        if (!this.pressed) {
          pressableCoolDownStartedTime = t;
          this.el.emit('pressedstarted');
        }
        this.pressed = true;
        return;
      }
    }
    if (this.pressed) {
      this.el.emit('pressedended');
    }
    this.pressed = false;
  },

  calculateFingerDistance: function (fingerPosition) {
    var el = this.el;
    var worldPosition = this.worldPosition;

    el.object3D.getWorldPosition(worldPosition);
    // worldPosition.copy(el.object3D.position);
    // el.object3D.parent.updateMatrixWorld();
    // el.object3D.parent.localToWorld(worldPosition);

    return worldPosition.distanceTo(fingerPosition);
  },
});

// new component for the hover effect with the mouse
AFRAME.registerComponent('hoverable', {
  schema: {},
  events: {
    mouseenter: function () {
      this.setEmissive(0x111111);
    },
    mouseleave: function () {
      this.setEmissive(0x000000);
    },
  },
  init() {
    this.setEmissive = this.setEmissive.bind(this);
  },
  setEmissive(color, channel) {
    this.el.object3D.traverse((child) => {
      if (child.material && child.material.emissive) {
        if (channel) {
          child.material.emissive[channel] = color;
        } else {
          child.material.emissive.set(color);
        }
      }
    });
  },
});

// Completely different than https://github.com/aframevr/aframe/blob/master/examples/showcase/hand-tracking/event-manager.js
AFRAME.registerComponent('event-manager', {
  init: function () {
    this.bindMethods();

    this.el.querySelectorAll('[button]').forEach((button) => {
      button.addEventListener('click', this.onClick);
    });
    this.agenda = document.getElementById('agenda');
  },

  bindMethods: function () {
    this.onClick = this.onClick.bind(this);
  },

  onClick: function (evt) {
    var targetEl = evt.target;
    this.el.querySelectorAll('[button]').forEach((button) => {
      button.removeState('pressed');
    });
    targetEl.addState('pressed');
    const eventDetail = {
      clientId: NAF.clientId,
      votingItem: this.agenda.components.agenda.data.votingItem,
      vote: targetEl.getAttribute('data-vote'),
    };
    NAF.connection.broadcastDataGuaranteed('vote', eventDetail);
    document.querySelector('[vote-results]').emit('voted', eventDetail);
    this.el.sceneEl.emit('ivoted');
  },
});

const VOTE_RESULTS = {};

AFRAME.registerComponent('vote-results', {
  init() {
    this.originalPosition = new THREE.Vector3();
    this.cameraWorldPosition = new THREE.Vector3();
    this.originalPosition.copy(this.el.object3D.position);
    this.agenda = document.getElementById('agenda');
    this.updateResults = this.updateResults.bind(this);
    this.resetResults = this.resetResults.bind(this);
    this.voteStartListener = this.voteStartListener.bind(this);
    this.voteStopListener = this.voteStopListener.bind(this);
    this.voteResetListener = this.voteResetListener.bind(this);
    this.textEl = document.createElement('a-entity');
    this.el.appendChild(this.textEl);
    this.graphEl = document.createElement('a-entity');
    this.graphEl.setAttribute('position', '1.5 0 0');
    this.graphEl.setAttribute('rotation', '90 0 0');
    this.graphEl.setAttribute('scale', '0.6 0.3 0.6');
    this.el.appendChild(this.graphEl);
    NAF.connection.subscribeToDataChannel('vote', (senderId, dataType, data, targetId) => {
      document.querySelector('[vote-results]').emit('voted', data);
    });
    NAF.connection.subscribeToDataChannel('vote-stop', () => {
      this.el.sceneEl.emit('vote-stop');
    });
  },

  voteStartListener() {
    this.updateResults();
  },
  voteStopListener() {
    this.updateResults(true);
  },
  voteResetListener() {
    this.resetResults();
  },
  play() {
    this.el.sceneEl.addEventListener('vote-start', this.voteStartListener);
    this.el.sceneEl.addEventListener('vote-stop', this.voteStopListener);
    this.el.sceneEl.addEventListener('vote-reset', this.voteResetListener);
  },
  pause() {
    this.el.sceneEl.removeEventListener('vote-start', this.voteStartListener);
    this.el.sceneEl.removeEventListener('vote-stop', this.voteStopListener);
    this.el.sceneEl.removeEventListener('vote-reset', this.voteResetListener);
  },
  events: {
    voted: function (evt) {
      const { clientId, votingItem, vote } = evt.detail;
      let results = VOTE_RESULTS[votingItem];
      if (!results) {
        results = VOTE_RESULTS[votingItem] = {};
      }
      results[clientId] = vote;
      const totalUsers = document.querySelectorAll('[player-info]').length;
      const total = Object.keys(results).length;
      if (total < totalUsers) {
        this.updateResults();
      } else {
        this.el.sceneEl.emit('vote-stop');
      }
    },
  },
  resetResults() {
    this.textEl.setAttribute('troika-text', 'value', '');
    this.graphEl.object3D.visible = false;
  },
  updateResults(forceResults) {
    const votingItem = this.agenda.components.agenda.data.votingItem;
    const results = VOTE_RESULTS[votingItem];
    if (!results) {
      this.textEl.setAttribute('troika-text', 'value', 'please vote');
      this.graphEl.object3D.visible = false;
      return;
    }

    const totalUsers = document.querySelectorAll('[player-info]').length;
    const total = Object.keys(results).length;
    const totalYes = Object.values(results).filter((v) => v === 'yes').length;
    const totalNo = Object.values(results).filter((v) => v === 'no').length;
    if (forceResults) {
      const yesPercentage = (totalYes / total) * 100;
      const noPercentage = (totalNo / total) * 100;
      this.textEl.setAttribute(
        'troika-text',
        'value',
        `voters: ${total}\nyes: ${yesPercentage.toFixed(2)}%\nno: ${noPercentage.toFixed(2)}%`,
      );
      this.graphEl.setAttribute('babia-pie', {
        legend: true,
        palette: JSON.stringify(['#65a30d', '#dc2626']),
        key: 'label',
        size: 'count',
        data: JSON.stringify([
          { label: 'yes', count: totalYes },
          { label: 'no', count: totalNo },
        ]),
      });
      this.graphEl.object3D.visible = true;
    } else {
      this.textEl.setAttribute('troika-text', 'value', `voters: ${total} / ${totalUsers}`);
    }
  },
});

function addAgendaTemplate() {
  const templateOuter = document.createElement('template');
  const templateInner = document.createElement('a-entity');
  templateOuter.id = `agenda-template`;
  templateOuter.appendChild(templateInner);
  const refTemplateId = `#${templateOuter.id}`;
  NAF.schemas.schemaDict[refTemplateId] = {
    template: refTemplateId,
    components: [
      {
        component: 'agenda',
      },
    ],
  };
  NAF.schemas.templateCache[refTemplateId] = templateOuter;
}

addAgendaTemplate();

AFRAME.registerComponent('item-up-button', {
  schema: { type: 'string' },
  init() {
    this.agenda = document.getElementById('agenda');
    this.el.setAttribute('button', 'label: up');
    this.el.object3D.scale.set(6, 6, 6);
    this.el.object3D.position.set(-1.9, 0, 0);
  },
  events: {
    click: function (evt) {
      setTimeout(() => this.agenda.components.agenda.moveItem(this.data, -1), 500);
    },
  },
});

AFRAME.registerComponent('item-down-button', {
  schema: { type: 'string' },
  init() {
    this.agenda = document.getElementById('agenda');
    this.el.setAttribute('button', 'label: down');
    this.el.object3D.scale.set(6, 6, 6);
    this.el.object3D.position.set(-1.2, 0, 0);
  },
  events: {
    click: function (evt) {
      setTimeout(() => this.agenda.components.agenda.moveItem(this.data, 1), 500);
    },
  },
});

AFRAME.registerComponent('item-vote-button', {
  schema: { type: 'string' },
  init() {
    this.voteStartListener = this.voteStartListener.bind(this);
    this.voteStopListener = this.voteStopListener.bind(this);
    this.agenda = document.getElementById('agenda');
    this.el.setAttribute('button', 'label: vote');
    this.el.object3D.scale.set(6, 6, 6);
    this.el.object3D.position.set(-0.5, 0, 0);
  },
  voteStartListener() {
    if (this.data === this.agenda.components.agenda.data.votingItem) {
      this.el.setAttribute('button', 'label: end');
    }
  },
  voteStopListener() {
    if (this.data === this.agenda.components.agenda.data.votingItem) {
      this.el.object3D.visible = false;
    }
  },
  play() {
    this.el.sceneEl.addEventListener('vote-start', this.voteStartListener);
    this.el.sceneEl.addEventListener('vote-stop', this.voteStopListener);
  },
  pause() {
    this.el.sceneEl.removeEventListener('vote-start', this.voteStartListener);
    this.el.sceneEl.removeEventListener('vote-stop', this.voteStopListener);
  },
  events: {
    click: function (evt) {
      if (this.data === this.agenda.components.agenda.data.votingItem) {
        NAF.connection.broadcastDataGuaranteed('vote-stop');
        this.el.sceneEl.emit('vote-stop');
      } else {
        this.agenda.setAttribute('agenda', 'votingItem', this.data);
        NAF.utils.takeOwnership(this.agenda);
      }
    },
  },
});

AFRAME.registerComponent('item-start-button', {
  schema: { type: 'string' },
  init() {
    this.agenda = document.getElementById('agenda');
    this.el.setAttribute('button', 'label: start');
    this.el.object3D.scale.set(6, 6, 6);
    this.el.object3D.position.set(-0.5, 0, 0);
  },
  events: {
    click: function (evt) {
      this.agenda.setAttribute('agenda', 'votingItem', this.data);
      NAF.utils.takeOwnership(this.agenda);
    },
  },
});

// Only a user with url with ?role=moderator will see the buttons.
AFRAME.registerComponent('agenda-items', {
  schema: {
    items: { type: 'string', default: '[]' },
  },
  init() {
    this.updateOrder = this.updateOrder.bind(this);
    const qs = new URLSearchParams(window.location.search);
    const isModerator = qs.get('role') === 'moderator';
    this.items = JSON.parse(this.data.items);
    this.items.forEach((item) => {
      const agendaItem = document.createElement('a-entity');
      agendaItem.setAttribute('data-item', item.id);
      let html = '';
      if (isModerator) {
        if (item.vote) {
          html += `<a-entity item-vote-button="${item.id}"></a-entity>`;
        } else {
          html += `<a-entity item-start-button="${item.id}"></a-entity>`;
        }
        html += `
      <a-entity item-up-button="${item.id}"></a-entity>
      <a-entity item-down-button="${item.id}"></a-entity>
      `;
      }
      html += `
      <a-entity troika-text="anchor:left;value:${item.label}"></a-entity>`;
      agendaItem.innerHTML = html;
      this.el.appendChild(agendaItem);
    });
  },
  updateOrder(itemsOrder) {
    // Select all list items and convert NodeList to Array for easy manipulation
    const itemsArray = Array.from(this.el.object3D.children.map((child) => child.el));
    // Sort the items array based on the itemsOrder array
    const sortedItems = itemsOrder.map((order) => itemsArray.find((item) => item.getAttribute('data-item') === order));
    // Append each sorted item back to the list, automatically reordering them in the DOM
    sortedItems.forEach((item) => item.removeFromParent());
    sortedItems.forEach((item) => item.addToParent());
  },
});

AFRAME.registerComponent('agenda', {
  dependencies: ['agenda-items'],
  schema: {
    votingItem: { type: 'string', default: '' },
    itemsOrder: { type: 'array', default: [] },
  },
  init() {
    this.moveItem = this.moveItem.bind(this);
    this.el.setAttribute('networked', {
      template: '#agenda-template',
      attachTemplateToLocal: true,
      networkId: 'agenda',
      persistent: true,
      owner: 'scene',
    });
    const itemsOrder = this.el.components['agenda-items'].items.map((item) => item.id);
    this.el.setAttribute('agenda', 'itemsOrder', itemsOrder);
  },
  moveItem(itemId, direction) {
    const itemsOrder = [...this.data.itemsOrder];
    const index = itemsOrder.indexOf(itemId);
    // Calculate new position
    const newIndex = index + direction;
    // Check if new position is within bounds
    if (newIndex < 0 || newIndex >= itemsOrder.length) return;
    // Swap items in the array
    [itemsOrder[index], itemsOrder[newIndex]] = [itemsOrder[newIndex], itemsOrder[index]];
    this.el.setAttribute('agenda', 'itemsOrder', itemsOrder);
    NAF.utils.takeOwnership(this.el);
  },
  update(oldData) {
    if (this.data.itemsOrder !== oldData.itemsOrder) {
      this.el.components['agenda-items'].updateOrder(this.data.itemsOrder);
    }
    if (this.data.votingItem !== '' && oldData.votingItem !== this.data.votingItem) {
      const needsVote = this.el.components['agenda-items'].items.find((item) => item.id === this.data.votingItem).vote;
      let button;
      const itemEl = this.el.querySelector(`[data-item='${this.data.votingItem}']`);
      if (needsVote) {
        this.el.sceneEl.emit('vote-start');
        button = itemEl.querySelector(`[item-vote-button='${this.data.votingItem}']`);
      } else {
        this.el.sceneEl.emit('vote-reset');
        button = itemEl.querySelector(`[item-start-button='${this.data.votingItem}']`);
        if (button) button.object3D.visible = false;
      }
      this.el.object3D.children.forEach((child) => {
        child.el.querySelector('[troika-text]').setAttribute('troika-text', 'color', 'white');
      });
      itemEl.querySelector('[troika-text]').setAttribute('troika-text', 'color', 'yellow');
    }
  },
});

AFRAME.registerComponent('vote-board', {
  init() {
    this.el.innerHTML = `
<a-entity menu position="0 0.4 0.5" rotation="-45 180 0" event-manager>
  <a-entity data-vote="yes" button="label: yes" position="-0.1 0 0"></a-entity>
  <a-entity data-vote="no" button="label: no" position="0.1 0 0"></a-entity>
</a-entity>
`;
    this.el.querySelectorAll('[button]').forEach((el) => {
      el.setAttribute('button', 'disabled', true);
    });
    this.voteStartListener = this.voteStartListener.bind(this);
    this.voteStopListener = this.voteStopListener.bind(this);
    this.voteResetListener = this.voteResetListener.bind(this);
  },
  voteStartListener() {
    this.el.querySelectorAll('[button]').forEach((el) => {
      el.removeState('pressed');
      el.setAttribute('button', 'disabled', false);
    });
  },
  voteStopListener() {
    this.el.querySelectorAll('[button]').forEach((el) => {
      el.setAttribute('button', 'disabled', true);
    });
  },
  voteResetListener() {
    this.el.querySelectorAll('[button]').forEach((el) => {
      el.removeState('pressed');
      el.setAttribute('button', 'disabled', true);
    });
  },
  play() {
    this.el.sceneEl.addEventListener('vote-start', this.voteStartListener);
    this.el.sceneEl.addEventListener('vote-stop', this.voteStopListener);
    this.el.sceneEl.addEventListener('ivoted', this.voteStopListener);
    this.el.sceneEl.addEventListener('vote-reset', this.voteResetListener);
  },
  pause() {
    this.el.sceneEl.removeEventListener('vote-start', this.voteStartListener);
    this.el.sceneEl.removeEventListener('vote-stop', this.voteStopListener);
    this.el.sceneEl.removeEventListener('ivoted', this.voteStopListener);
    this.el.sceneEl.removeEventListener('vote-reset', this.voteResetListener);
  },
});

document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  sceneEl.addEventListener(
    'waypoints-ready',
    () => {
      document.querySelectorAll('[waypoint]').forEach((wp) => {
        if (!(wp.components.waypoint.data.willDisableMotion && wp.components.waypoint.data.canBeOccupied)) return;
        const voteBoard = document.createElement('a-entity');
        wp.parentNode.appendChild(voteBoard);
        voteBoard.object3D.position.copy(wp.object3D.position);
        voteBoard.object3D.rotation.copy(wp.object3D.rotation);
        voteBoard.setAttribute('vote-board', '');
      });
    },
    { once: true },
  );
});
