# Card Picker

A phone-sized deck of cards. Shake to shuffle, then touch the screen to pick one
card at random from a standard 52-card deck.

## Development

Requires Node.js 20.19 or newer.

```sh
pnpm install
pnpm dev
```

Run the automated checks with `pnpm test` and create a production build with
`pnpm build`.

Motion permission and device motion events require HTTPS on supported mobile
browsers. The app provides a touch fallback on devices where motion is not
available.

## Deployment

Pushes to `main` are built and deployed to GitHub Pages by
`.github/workflows/deploy-pages.yml`. In the GitHub repository settings, set
**Pages → Build and deployment → Source** to **GitHub Actions**.

## Card artwork

The card faces are adapted from
[robmikh/svg-cards](https://github.com/robmikh/svg-cards), which places the
artwork in the public domain. A copy of its license is included alongside the
assets.
