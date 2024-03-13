/* global AFRAME */
AFRAME.registerComponent('character-controller', {
  init() {
    setTimeout(() => {
      const rig = document.getElementById('rig');
      rig.setAttribute(
        'simple-navmesh-constraint',
        'navmesh:.environmentGround,.environmentDressing;fall:10;height:0;exclude:.navmesh-hole;',
      );
    }, 2000);
  },
});
