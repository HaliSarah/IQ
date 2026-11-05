/*
  Title:       QR Platform Install Button
  Author:      Hali Sarah Parsons
  Date:        2026-11-05
  Modified By: Claude (Anthropic), 2026-11-05
  Description: Registers the service worker and runs the "Install App" button.
               Deploy to: QRCode/pwa-install.js
*/
(function () {
  'use strict';

  const button = document.getElementById('install-app-btn');
  const iosDialog = document.getElementById('ios-install-dialog');

  // WHY stored: the browser allows the prompt only from a later user tap.
  let installPrompt = null;

  /**
   * Detects a running installed copy.
   * WHY both checks: Safari reports this through its own navigator.standalone flag.
   */
  function isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  /**
   * Detects iPhones and iPads.
   * WHY the touch check: iPads identify themselves as Macs, and a real Mac has
   * no touch points.
   */
  function isIos() {
    const ua = window.navigator.userAgent;
    return /iphone|ipad|ipod/i.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  }

  /**
   * Runs the install for this browser.
   * WHY two paths: iOS has no install prompt, so people must be shown the Share steps.
   */
  async function handleInstallClick() {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null; // WHY: each prompt event can only be used once.
      button.hidden = true;
    } else if (isIos()) {
      iosDialog.showModal();
    }
  }

  // WHY the guard: a failed registration must never break the generator itself.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/QRCode/sw.js', { scope: '/QRCode/' })
        .catch((error) => console.warn('QR app setup skipped:', error));
    });
  }

  if (!button || isInstalled()) return;

  // WHY preventDefault: it holds back the browser's own banner so the nav button
  // decides the moment. The button stays hidden where installing isn't offered.
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    button.hidden = false;
  });

  window.addEventListener('appinstalled', () => { button.hidden = true; });

  button.addEventListener('click', handleInstallClick);

  if (isIos() && iosDialog) {
    button.hidden = false;
    document.getElementById('ios-install-close')
      .addEventListener('click', () => iosDialog.close());
  }
}());
