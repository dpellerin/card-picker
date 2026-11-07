# Card Picker

A phone-sized deck of cards. Shake to shuffle, then touch the screen to pick one
card at random from a standard 52-card deck.

I wrote this little app for poker runs. If you don't know what a poker run
is, it's a motorcycle ride with stops along the way — at each stop you pick
a card. At the end of the run you have a poker hand. Whoever has the
highest hand wins the pot.

Good luck!

## Development

Requires Node.js 24 and pnpm 10.34.9 (pinned in `packageManager`).

```sh
pnpm install
pnpm dev
```

Run the automated checks with `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm test:toolchain` and `pnpm audit`. Create a production build with `pnpm build`.
The PR validation workflow runs all of these, including the full development
dependency audit and a synthetic localhost-only denied-file regression.

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
