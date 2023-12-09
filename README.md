# NAF nametag example with UI

The [GitHub repo](https://github.com/networked-aframe/naf-nametag-solidjs) is synced with the [code on glitch](https://glitch.com/edit/#!/naf-nametag-solidjs) if you want to remix there.

This is the NAF nametag example but with a UI to enter the room written with [SolidJS](https://www.solidjs.com/) and [Tailwind CSS](https://tailwindcss.com/). It contains all the configurations files to develop the UI with [VS code](https://code.visualstudio.com/): webpack, tailwindcss with postcss, prettier, eslint, tsconfig for solid-js.
In VS code, be sure to install the following addons: Prettier - Code formatter, ESLint, Tailwind CSS IntelliSense.

See the src folder how the UI works.

For the app to run on glitch for development, we used in `package.json`:

```
"start": "cross-env NODE_ENV=development node server.js",
```

that adds the webpack-dev-middleware with the easyrtc/express server on the same port.
That's the same command for `npm run dev`.

For production, you should do a build with `npm run build`
and change back to

```
"start": "node server.js",
```

Note that webpack hot reload is not supported when running through the easyrtc
server with webpack-dev-middleware. It's working with `npm run dev2` that uses the
full webpack-dev-server but the easyrtc server won't be working.
That can probably be fixed by using two ports (one for easyrtc server,
one for webpack-dev-server) to develop locally, but that won't work on glitch.

You can read more on [using SolidJS with A-Frame](https://aframe.wiki/en/#!pages/solidjs.md) on the A-Frame wiki.
