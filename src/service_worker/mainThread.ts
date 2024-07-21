async function registerServiceWorker() {
  console.log('Starting to registerServiceWorker.');
  await navigator.serviceWorker.register('./service_worker.js');
  console.log('registerServiceWorker finished.');
}

function getRegistration() {
  return navigator.serviceWorker.getRegistration();
}

async function unRegisterServiceWorker() {
  const registration = await getRegistration();

  registration && await registration.unregister();
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