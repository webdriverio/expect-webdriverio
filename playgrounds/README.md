# expect-webdriverio Playgrounds

Workspaces for testing expect-webdriverio with Jasmine, Jest, and Mocha.

## Setup

From the project root, run the following commands:
```sh
pnpm install
pnpm run playgrounds:setup
pnpm run playgrounds:checks:all
```

To run a single project individually (for example, Mocha):
```sh
cd playgrounds/mocha
pnpm run checks:all
```

## Visual Snapshots

Visual tests can occasionally fail if the website's layout or visuals change. 
You can update the expected snapshots by running:
```sh
pnpm run playgrounds:snapshots:update
```
