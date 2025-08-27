# 3D Engine & N Body Gravity Simulator (Gravisim) & Raycasting

## What is this repo for?

In this repo I am studying linear algebra, webgl, minecraft engine and 3D engines in general

I try to use as less libraries as possible, and even mathjs I don't need that much (it's just for precision)

## 3D Engine

Runs only on webgl

I am planning to do a minecraft-clone

Controls:
WASD - movements
Space - move up
Shift - move down
Mouse - camera rotation

## Gravisim

Runs with real newton physics

Use left click to move objects

The arrows indicate magnitude of force of attraction between objects

## Raycasting

Just raycasting with some walls in it, used to imitate 3D vision

Use left click or WASD to move raycasting sphere

Use Q and R to rotate

### General

Use mousewheel to scroll in or out

### About codebase

UI with canvas, webgl

Only prod library is mathjs

Configurable only from code right now

There is tests for my math library (for matrices) implemented with vitest

### To run in development use

```
npm install
```

```
npm start
```

### To run tests use

```
npm install
```

```
npm run test
```
