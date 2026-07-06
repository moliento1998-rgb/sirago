// SiraGo — Service Worker v2 pour notifications push en arrière-plan
// Ce fichier doit être placé à la RACINE du site (même dossier que index.html)

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:      "AIzaSyC-GuIuCfv21L__y5BNa_JErmPKGtnFHVM",
  authDomain:  "sirago-7640a.firebaseapp.com",
  databaseURL: "https://sirago-7640a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:   "sirago-7640a",
});

const messaging = firebase.messaging();

// ── CORRECTION 1 : install + activate ────────────────────────────────────────
// Sans ces deux handlers, une nouvelle version du SW ne prend effet
// qu'après fermeture complète de tous les onglets + réouverture.
// Avec skipWaiting() + clients.claim(), la mise à jour est active immédiatement
// dès le prochain rechargement — sans que l'utilisateur ait besoin de faire quoi que ce soit.

self.addEventListener('install', event => {
  self.skipWaiting();  // le nouveau SW remplace l'ancien sans attendre
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());  // prend le contrôle de tous les onglets ouverts immédiatement
});

// ── Notification FCM en arrière-plan ─────────────────────────────────────────
messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || '🍸 SiraGo', {
    body:             body || 'Vous avez une notification.',
    icon:             icon || 'https://em-content.zobj.net/source/google/387/tropical-drink_1f379.png',
    badge:            'https://em-content.zobj.net/source/google/387/tropical-drink_1f379.png',
    tag:              'sirago',
    renotify:         true,
    requireInteraction: true,
    data:             payload.data || {}
  });
});

// ── CORRECTION 2 : clic sur la notification ───────────────────────────────────
// L'ancienne version cherchait une URL contenant 'bar-app' et ouvrait 'bar-app.html'.
// Votre fichier s'appelle index.html — la recherche ne trouvait jamais l'onglet ouvert,
// et ouvrait systématiquement un nouvel onglet vers la mauvaise URL.
// Correction : on cherche simplement un onglet de votre domaine GitHub Pages,
// et on ouvre './' (= index.html) si aucun n'est trouvé.

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      // Cherche un onglet déjà ouvert sur le domaine (peu importe le nom du fichier)
      const existing = cls.find(c => 'focus' in c);
      if (existing) return existing.focus();
      // Sinon ouvre index.html
      return clients.openWindow('./');
    })
  );
});
