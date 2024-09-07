# Vote module

You can add a vote module to your networked experience, it will add a vote board to all seated waypoints with agenda items to vote or not.
It works on desktop and VR with hands.
Buttons on the vote board are by default disabled (gray and not interactive) until an agenda item requires a vote. Once the user voted, the buttons are disabled so they can't change their vote.
The vote ends when all participants in the room voted or the moderator force ended the vote.
At the end of the vote, results are shown.

A moderator can start an agenda item with a "start" button, the item text changes from white to yellow indicating the current discussed item for everyone.
An item can have a "vote" button instead of "start" button that will start the vote on the item. The "vote" button will change to an "end" button to force ending the vote.
Reordering items with "up" and "down" buttons is also possible, the order is properly networked to everyone.

## How to use it

```html
<script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-gltf-model-plus@1.0.0/dist/gltf-model-plus.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/aframe-layout-component@5.3.0/dist/aframe-layout-component.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/aframe-troika-text@0.11.0/dist/aframe-troika-text.min.js"></script>
<!-- babia post 1.2.6, some graphs examples works with aframe 1.5.0 -->
<script src="https://cdn.jsdelivr.net/gh/babiaxr/aframe-babia-components@c5a5ec8/dist/aframe-babia-components.min.js"></script>
<!-- <script src="https://cdn.jsdelivr.net/npm/aframe-text-geometry-component@0.5.2/dist/aframe-text-geometry-component.min.js"></script> -->
<script src="./vote.js"></script>

<a-scene raycaster="far: 100; objects: .babiaxraycasterclass,.clickable">
  <a-entity id="vote-results" position="-10 2.5 143" billboard vote-results></a-entity>
  <a-entity
    id="agenda"
    position="-10 2 136"
    layout="type: line; plane: yz; margin: 0.4; reverse: true"
    billboard
    agenda
    agenda-items='items:[{"label":"Adoption of agenda","id":"1","vote":true},{"label":"Chair\u0027s announcements","id":"2"},{"label":"Adoption of minutes","id":"3","vote":true},{"label":"Vote on Pilot Projects and Preparatory Actions (PPPAs)","id":"4","vote":true},{"label":"Amending Directive 2013/34/EU","id":"5"}]'
  ></a-entity>
</a-scene>
```

Including `vote.js` file has a side effect of adding `vote-board` component to all seated waypoints (willDisableMotion and canBeOccupied).

The following code is at the end of the `vote.js` file:

```js
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
```

## Components

### `button`, `pressable`, `hoverable` primitive components

`button`, `pressable` are modified versions of the components found in the https://aframe.io/examples/showcase/handtracking/ example.
A `disabled` prop has been added to `button` that toggles "clickable" class and `hoverable` component (for desktop) and `pressable` component for VR hands.

The `pressable` component has a change to calculate the index finger position in world position to work with having hands in a camera rig.
An other change that was introduced is a cool down of 500ms to not check for finger collision for all pressable buttons to make the "up" and "down" buttons work.

The `hoverable` component is used to set the emissive color of the material on hover (mouseenter and mouseleave events).
The `.clickable` class needs to be added to your `raycaster` component.

### agenda items

The `agenda` component is networked, syncing `votingItem` (currently discussed item) and `itemsOrder`
`agenda` depends on `agenda-items`.
`agenda-items` currently has just a single prop `items` that is json of agenda items that is an array of
`{"label": "some topic", "id": "someid", "vote": true }`
The "vote" key can be missing, it will be set to false by default.
If the label contains an apostroph, you need to replace it by `\u0027`.

The `agenda-items` component uses `troika-text` and `layout` components.

The `item-up-button`, `item-down-button`, `item-vote-button`, `item-start-button` components all uses `button` component and are used for an agenda item for the moderator.

The "start" button emits `vote-reset` event so that vote board buttons are reset to a disabled state and vote results reset to an empty state for an item without vote.
The "vote" button emits `vote-start` event to start the vote, making the vote board buttons interactive.
The "end" button emits `vote-stop` event and broadcasts naf message `vote-stop` to stop the vote session.

The moderator is someone that enters the room with `?role=moderator` in the url.
Example of url for moderator to enter the room as a specific seat
`https://192.168.1.15:8080/vote.html?role=moderator#seat-moderator` where `seat-moderator` is the waypoint id.

### vote board

The `vote-board` component is a board in front of seated waypoints that shows a "Yes" and "No" buttons.
This uses `menu` and `event-manager` components, those two components are only used with `vote-board`.
The `menu` component is just adding a gray plane.
The `event-manager` component handles the click event on the buttons, on click it emits an "ivoted" event that is used to disable the buttons, and emits a `voted` event on the `[vote-results]` entity and broadcasts a `vote` message to all participants.

Current vote choices "Yes" and "No" are hard coded in the `vote-board` component. You can modify the choices in the component and the other components will adapt accordingly.

The buttons are not networked, so other users can't see your vote. If you want the vote to not be confidential, you could add a networked schema for button
that sync the disabled property and the pressed state (would need to be converted to a property really).

### vote results

The `vote-results` component uses `troika-text` to show texts and at the end of the vote it uses `babia` for the graph.
The `.babiaxraycasterclass` class needs to be added to your `raycaster` component if you want to target a part of the graph to show the legend.

Vote results are maintained in memory in a VOTE_RESULTS object for each participant. There is no server part for it.
The component listens for naf messages `vote` (a participant voted) and `vote-stop` (moderator force stopped the vote). On receiving `vote-stop` naf message, it emits the `vote-stop` event that will disable the vote buttons even if the user didn't vote yet.
