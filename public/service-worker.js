importScripts("/precache-manifest.20775a2d0981116bac710eaa80afaad9.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
const CACHE_NAME = 'offline';
// Customize this with a different URL if needed.
const OFFLINE_URL = 'offline.html';

workbox.precaching.precacheAndRoute(self.__precacheManifest);

console.log('self.precache', self.__precacheManifest);

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            // Setting {cache: 'reload'} in the new request will ensure that the
            // response isn't fulfilled from the HTTP cache; i.e., it will be from
            // the network.
            await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        })(),
    );
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
});

const appShellCacheKey = workbox.precaching.getCacheKeyForURL('/index.html');
workbox.routing.registerNavigationRoute(appShellCacheKey);

workbox.routing.registerRoute(
    function(routeData) {
        return /text\/html/.test(routeData.event.request.headers.get('accept'));
    },
    function(args) {
        return caches.match(args.event.request).then(function(response) {
            if (response) {
                return response;
            } else {
                return fetch(args.event.request)
                    .then(function(res) {
                        const cacheKey = workbox.precaching.getCacheKeyForURL(args.event.request.url);
                        return caches.open(cacheKey).then(function(cache) {
                            cache.put(args.event.request.url, res.clone());
                            return res;
                        });
                    })
                    .catch(function(err) {
                        return caches.match('/offline.html').then(function(res) {
                            return res;
                        });
                    });
            }
        });
    },
);

self.addEventListener('notificationclick', (event) => {
    let notification = event.notification;
    let action = event.action;

    console.log(notification);

    if (action === 'confirm') {
        console.log('Confirm was chosen');
        notification.close();
    } else {
        console.log(action);
        event.waitUntil(
            clients.matchAll().then(function(clis) {
                var client = clis.find(function(c) {
                    return c.visibilityState === 'visible';
                });

                if (client !== undefined) {
                    client.navigate(notification.data.url);
                    client.focus();
                } else {
                    clients.openWindow(notification.data.url);
                }

                notification.close();
            }),
        );
    }
});

self.addEventListener('notificationclose', function(event) {
    console.log('Notification was closed', event);
});

self.addEventListener('push', (event) => {
    console.log('Push Notification received', event);

    let data = { title: 'New!', content: 'Something new happened!', openUrl: '/' };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    let options = {
        body: data.content,
        icon: 'img/icons/android-chrome-192x192.png',
        badge: 'img/icons/android-chrome-192x192.png',
        data: {
            url: data.openUrl,
        },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

