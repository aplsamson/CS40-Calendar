importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
    apiKey: "AIzaSyCyoUxG8Qfc6g5kwgqRK0Q2J0k1tXtQeVs",
    authDomain: "cs40-calendar.firebaseapp.com",
    projectId: "cs40-calendar",
    storageBucket: "cs40-calendar.firebasestorage.app",
    messagingSenderId: "661443751516",
    appId: "1:661443751516:web:ddee708ab5a1014cadc099"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background notifications (when app is closed)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://www.aviatorgear.com/images/product/large/39950.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Cache Logic
const CACHE_NAME = 'cs40-calendar-v3';
const urlsToCache = [
  './index.html',
  './manifest.json',
  'https://www.aviatorgear.com/images/product/large/39950.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});