/* global AFRAME */
import './player-info';
import './change-room';

AFRAME.registerComponent('spawn-in-circle', {
  schema: {
    radius: { type: 'number', default: 1 },
  },

  init: function () {
    const el = this.el;
    const center = el.getAttribute('position');

    const angleRad = this.getRandomAngleInRadians();
    const circlePoint = this.randomPointOnCircle(this.data.radius, angleRad);
    const worldPoint = { x: circlePoint.x + center.x, y: center.y, z: circlePoint.y + center.z };
    el.setAttribute('position', worldPoint);

    // const angleDeg = (angleRad * 180) / Math.PI;
    // const angleToCenter = -1 * angleDeg + 90;
    // angleRad = THREE.MathUtils.degToRad(angleToCenter);
    // el.object3D.rotation.set(0, angleRad, 0);
  },

  getRandomAngleInRadians: function () {
    return Math.PI * 2 * (Math.floor(Math.random() * 8) / 8.0);
  },

  randomPointOnCircle: function (radius, angleRad) {
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    return { x: x, y: y };
  },
});
