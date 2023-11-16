# NAF nametag example with UI

This is the NAF nametag example but with a UI to enter the room written with [SolidJS](https://www.solidjs.com/) and [Tailwind CSS](https://tailwindcss.com/). It contains all the configurations files to develop the UI with [vscode](https://code.visualstudio.com/): webpack, tailwindcss with postcss, prettier, eslint, tsconfig for solid-js.

See the src folder how the UI works. Typescript is not enabled in this example for simplicity.
You can rename ui.js to ui.tsx if you want to use typescript annotations.

For it to work on glitch for development, we used in `package.json`:

```
"start": "cross-env NODE_ENV=development node server.js",
```

that starts the webpack-dev-server with the easyrtc server on the same port.

For production, you should do a build with `npm run build`
and change back to

```
"start": "node server.js",
```

Note that webpack hot reload is not supported when running through the easyrtc
server. It's working with `npm run dev2` but the easyrtc server won't be
working. That can probably be fixed by using two ports (one for easyrtc server,
one for webpack-dev-server) to develop locally, but that won't work on glitch.
