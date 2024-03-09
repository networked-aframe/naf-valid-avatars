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
  events: {
    'navigation-start': function () {
      if (this.el.hasAttribute('simple-navmesh-constraint')) {
        this.el.setAttribute('simple-navmesh-constraint', 'enabled', false);
      }
    },
    'navigation-end': function () {
      if (this.el.hasAttribute('simple-navmesh-constraint')) {
        this.el.setAttribute('simple-navmesh-constraint', 'enabled', true);
      }
    },
  },
});
