# Example of using realistic animated avatars in networked-aframe

The [GitHub repo](https://github.com/networked-aframe/naf-valid-avatars) is synced with the [code on glitch](https://glitch.com/edit/#!/naf-valid-avatars) if you want to remix there.

This example is based on [naf-nametag-solidjs](https://github.com/networked-aframe/naf-nametag-solidjs) for the SolidJS and Tailwind CSS boilerplate
and is using the avatars from the [valid-avatars-glb GitHub repository](https://github.com/c-frame/valid-avatars-glb).

Some highlights of this example:

- Using the cursor-teleport and simple-navmesh-constraint components to move on the hills in the japan environment (PR [#26](https://github.com/networked-aframe/naf-valid-avatars/pull/26))
, see [video](https://github.com/networked-aframe/naf-valid-avatars/assets/112249/73054d01-6c1b-4d29-9eb1-81cba45d938c)
- Traversing portal to switch the scene and naf room, using obb-collider (PR [#25](https://github.com/networked-aframe/naf-valid-avatars/pull/25) and [#27](https://github.com/networked-aframe/naf-valid-avatars/pull/27)), see [video](https://github.com/networked-aframe/naf-valid-avatars/assets/112249/4dd0abfb-840a-4da1-9e42-6fb4ec48adfc)

To add a new mixamo animation to the avatars, see [how to create an animation](https://github.com/networked-aframe/naf-valid-avatars/blob/main/docs/animation.md).
