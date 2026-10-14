import test from 'node:test';
import assert from 'node:assert/strict';
import { offlineStatus } from '../src/utils/offline.js';

// offlineStatus reads the globals `navigator` and `MessageChannel`.
// FakeChannel links the ports like a real one: posting to port2
// delivers to port1.onmessage, which is what the service worker does.
const realNavigator = globalThis.navigator;
const realChannel = globalThis.MessageChannel;
class FakeChannel {
  constructor() {
    const c = this;
    this.port1 = { onmessage: null };
    this.port2 = { postMessage(data) { queueMicrotask(() => c.port1.onmessage?.({ data })); } };
  }
}
function setGlobals(navigatorValue, t) {
  Object.defineProperty(globalThis, 'navigator', { value: navigatorValue, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'MessageChannel', { value: FakeChannel, configurable: true, writable: true });
  t.after(() => {
    Object.defineProperty(globalThis, 'navigator', { value: realNavigator, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'MessageChannel', { value: realChannel, configurable: true, writable: true });
  });
}
function controllerWith(reply) {
  return { postMessage(_msg, [port]) { if (reply !== 'never') port.postMessage(reply); } };
}

test('no service worker API reports offline unavailable, never ready', async (t) => {
  setGlobals({}, t);
  const s = await offlineStatus();
  assert.equal(s.ready, false);
  assert.match(s.message, /unavailable in this browser/);
});

test('no controller yet means setup still in progress, not ready', async (t) => {
  setGlobals({ serviceWorker: {} }, t);
  const s = await offlineStatus();
  assert.equal(s.ready, false);
  assert.match(s.message, /still in progress/);
});

test('worker ready reply passes through with its message', async (t) => {
  setGlobals({ serviceWorker: { controller: controllerWith({ ready: true, version: 'v1', message: 'Offline assets verified.' }) } }, t);
  const s = await offlineStatus();
  assert.equal(s.ready, true);
  assert.equal(s.message, 'Offline assets verified.');
});

test('worker incomplete-cache reply passes through as not ready', async (t) => {
  setGlobals({ serviceWorker: { controller: controllerWith({ ready: false, version: 'v1', message: 'Offline cache is incomplete. Reconnect to install all assets.' }) } }, t);
  const s = await offlineStatus();
  assert.equal(s.ready, false);
  assert.match(s.message, /incomplete/);
});

test('silent worker resolves could-not-check instead of hanging', async (t) => {
  setGlobals({ serviceWorker: { controller: controllerWith('never') } }, t);
  const realSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => { queueMicrotask(fn); return 0; };
  t.after(() => { globalThis.setTimeout = realSetTimeout; });
  const s = await offlineStatus();
  assert.equal(s.ready, false);
  assert.match(s.message, /could not be checked/);
});

test('a late worker reply after the timeout cannot flip the result', async (t) => {
  let port;
  setGlobals({ serviceWorker: { controller: { postMessage(_m, [p]) { port = p; } } } }, t);
  const realSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => { queueMicrotask(fn); return 0; };
  t.after(() => { globalThis.setTimeout = realSetTimeout; });
  const s = await offlineStatus();
  assert.equal(s.ready, false);
  assert.doesNotThrow(() => port.postMessage({ ready: true, message: 'Offline assets verified.' }));
  assert.equal(s.ready, false);
});
