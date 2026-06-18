// BarFlow — Service Worker v2.6
// Place this file at the ROOT of your site (same folder as index.html / bar-app.html)

// ⚠️ Replace with your own Firebase config values
const FIREBASE_CONFIG = {
  apiKey:      "AIzaSyC-GuIuCfv21L__y5BNa_JErmPKGtnFHVM",
  authDomain:  "sirago-7640a.firebaseapp.com",
  databaseURL: "https://sirago-7640a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:   "sirago-7640a",
};

// ── Install & Activate (cache nothing — this SW is only for notifications) ───
self.addEventListener('install',  e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── Notification click → focus or open the app ───────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      // If app is already open in a tab, focus it
      const existing = cls.find(c => c.url.includes('bar-app') || c.url.includes('index'));
      if (existing && 'focus' in existing) return existing.focus();
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

// ── Message from page → show notification ────────────────────────────────────
// (Legacy channel kept for compatibility — main path is reg.showNotification in page)
self.addEventListener('message', event => {
  const data = event.data;
  if (!data || data.type !== 'SHOW_NOTIFICATION') return;
  event.waitUntil(
    self.registration.showNotification(data.title || '🍸 BarFlow', {
      body:             data.body  || 'Commande prête !',
      icon:             data.icon  || '',
      badge:            data.icon  || '',
      tag:              data.tag   || 'barflow',
      renotify:         true,
      requireInteraction: true,
    })
  );
});

// ── Firebase Cloud Messaging (background push — optional, requires FCM setup) ─
try {
  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

  if (FIREBASE_CONFIG.apiKey !== 'REMPLACER_PAR_VOTRE_API_KEY') {
    firebase.initializeApp(FIREBASE_CONFIG);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(payload => {
      const { title, body, icon } = payload.notification || {};
      return self.registration.showNotification(title || '🍸 BarFlow', {
        body:    body  || 'Vous avez une nouvelle notification.',
        icon:    icon  || '',
        tag:     'barflow-fcm',
        renotify: true,
        requireInteraction: true,
      });
    });
  }
} catch(e) {
  // FCM not configured — Firebase Realtime DB listener handles notifications instead
  console.log('FCM not configured, using Realtime DB listener for push.');
}
