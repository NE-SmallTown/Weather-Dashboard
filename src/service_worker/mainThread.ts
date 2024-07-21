import { SERVICE_WORKER_ACTION_CLEAR_POLLING } from '../utils/consts';

async function registerServiceWorker() {
  console.log('Starting to registerServiceWorker.');
  await navigator.serviceWorker.register('./service_worker.js');
  console.log('registerServiceWorker finished.');
}

export function getRegistration() {
  return navigator.serviceWorker.getRegistration();
}

export async function unRegisterServiceWorker() {
  const registration = await getRegistration();

  registration && await registration.unregister();
}

export async function clearPolling() {
  const registration = await getRegistration();

  if (registration) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        action: SERVICE_WORKER_ACTION_CLEAR_POLLING,
      });
    } else {
      console.log('No service worker controller found. Try refreshing the page.');
    }
  }
}

function requestNotificationPermission() {
  return Notification.requestPermission()
    .then((permission) => {
      console.log('Promise resolved: ' + permission);

      navigator.serviceWorker.onmessage = function (e) {
        // messages from service worker.
        console.log('client side onmessage e.data:', e.data);
      };
    })
    .catch((error) => {
      console.log('Promise was rejected');
      console.log(error);
    });
}

export default async function main() {
  await unRegisterServiceWorker();

  await registerServiceWorker();

  await requestNotificationPermission();
}