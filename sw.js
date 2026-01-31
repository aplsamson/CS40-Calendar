// Import Firebase libraries for the Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCyoUxG8Qfc6g5kwgqRK0Q2J0k1tXtQeVs",
    authDomain: "cs40-calendar.firebaseapp.com",
    projectId: "cs40-calendar",
    storageBucket: "cs40-calendar.firebasestorage.app",
    messagingSenderId: "661443751516",
    appId: "1:661443751516:web:ddee708ab5a1014cadc099"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://www.aviatorgear.com/images/product/large/39950.jpg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = 'cs40-calendar-v2';
const urlsToCache = [
  './index.html',
  './manifest.json',
  'https://www.aviatorgear.com/images/product/large/39950.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});