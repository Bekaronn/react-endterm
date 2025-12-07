const SHELL_CACHE = 'shell-v1';
const API_CACHE = 'api-cache';

// App Shell файлы для кеширования при установке
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/vite.png',
  '/book-search.png',
];

// Установка - кешируем App Shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );
});

// Активация - удаляем старые кеши и берем управление
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      Promise.all(
        keys.filter(key => key !== SHELL_CACHE).map(key => caches.delete(key))
        )       
    })
  );
});

// Обработка запросов
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем не-GET запросы и Firebase авторизацию
  if (request.method !== 'GET') {
    return;
  }

  // Не кешируем Firebase/Google APIs
  if (url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('identitytoolkit')) {
    return;
  }

  // Навигационные запросы (загрузка страниц)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        // Кешируем HTML при успешном запросе
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then(cache => {
            cache.put(request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Оффлайн: возвращаем закешированный index.html для всех маршрутов
        console.log('[SW] Offline, serving cached index.html for:', request.url);
        return caches.match('/index.html').then(response => {
          return response || caches.match('/').then(res => {
            return res || new Response('Offline', { status: 503 });
          });
        });
      })
    );
    return;
  }

  // Все статические файлы с того же домена (JS, CSS, картинки, модули)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        // Если есть в кеше - возвращаем сразу
        if (cached) {
          return cached;
        }

        // Если нет - загружаем и кешируем
        return fetch(request).then(response => {
          // Кешируем все успешные ответы
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then(cache => {
              cache.put(request, clone).catch(err => {
                console.error('[SW] Error caching file:', err);
              });
            });
          }
          return response;
        }).catch(() => {
          console.log('[SW] Network error, trying cache for:', request.url);
          // Оффлайн - возвращаем из кеша, если есть
          return caches.match(request).then(res => {
            if (res) return res;

            // Отдаем пустой ответ с корректным MIME, чтобы не было ошибок модуля
            let contentType = 'text/plain';
            if (request.destination === 'script' || request.destination === 'worker') {
              contentType = 'application/javascript';
            } else if (request.destination === 'style') {
              contentType = 'text/css';
            }

            return new Response('', {
              status: 503,
              statusText: 'Offline',
              headers: { 'Content-Type': contentType },
            });
          });
        });
      })
    );
    return;
  }

  // OpenLibrary API - кешируем публичные запросы
  if (url.hostname === 'openlibrary.org' &&
    (url.pathname.startsWith('/search.json') ||
      url.pathname.startsWith('/works/') ||
      url.pathname.startsWith('/authors/'))) {

    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return cache.match(request).then(cached => {
          // Для поиска - stale-while-revalidate
          if (url.pathname.startsWith('/search.json')) {
            // Обновляем кеш в фоне
            fetch(request).then(response => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
            }).catch(() => { });

            // Возвращаем кеш сразу, если есть
            if (cached) {
              return cached;
            }

            // Если кеша нет - делаем запрос
            return fetch(request).then(response => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            }).catch(() => {
              return cached || Promise.reject(new Error('Offline'));
            });
          } else {
            // Для деталей - network-first
            return fetch(request).then(response => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            }).catch(() => {
              return cached || Promise.reject(new Error('Offline'));
            });
          }
        });
      })
    );
    return;
  }
});
