/*
  Title:       QR Platform Service Worker
  Author:      Hali Sarah Parsons
  Date:        2026-11-05
  Modified By: Claude (Anthropic), 2026-11-05
  Description: Makes /QRCode installable and shows a branded screen when offline.
               Deploy to: QRCode/sw.js (it must sit here to control /QRCode/).
*/

// WHY a version in the name: changing it is how a future deploy replaces old files.
const CACHE_NAME = 'iq-qr-v1';
const OFFLINE_URL = '/QRCode/offline.html';

// WHY so short a list: only the offline screen needs to exist with no connection.
const PRECACHE_URLS = [OFFLINE_URL, '/QRCode/icons/icon-192.png'];

/**
 * Stores the offline screen ahead of time.
 * WHY during install: once the connection is gone it is too late to fetch it.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // WHY: otherwise fixes wait until every tab closes.
  );
});

/**
 * Deletes caches from older versions and takes over open pages.
 * WHY: leftover caches would sit on the visitor's phone using storage forever.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

/**
 * Handles page loads only, and always tries the live site first.
 * WHY network first: a cached generator could show old prices or old code.
 * WHY everything else is left alone: Firebase, Stripe, and the order worker must
 * talk to the network directly, so sign-ins and payments never touch this file.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // WHY: each scan must reach the redirect page live so it is logged and sent to
  // the current destination, even for visitors who installed the app.
  const isScanRedirect = url.pathname.startsWith('/QRCode/Account');

  if (request.mode !== 'navigate' || isScanRedirect) return;

  event.respondWith(
    // WHY catch: fetch only rejects on a network failure, which is exactly when
    // the offline screen should appear. Server errors still show the real page.
    fetch(request).catch(() => caches.match(OFFLINE_URL))
  );
});
