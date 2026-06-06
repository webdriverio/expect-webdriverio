# expect-webdriverio Playgrounds

Workspaces for testing expect-webdriverio with Jasmine, Jest, and Mocha.

## Setup

From the project root, run the following commands:
```sh
npm install
npm run playgrounds:setup
npm run playgrounds:checks:all
```

To run a single project individually (for example, Mocha):
```sh
cd playgrounds/mocha
npm run checks:all
```

## Visual Snapshots

Visual tests can occasionally fail if the website's layout or visuals change. 
You can update the expected snapshots by running:
```sh
npm run playgrounds:snapshots:update
```
