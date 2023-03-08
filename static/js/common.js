const accelerationThreshold = 15;
let isFallAlertActive = true;
window.addEventListener(
  "devicemotion",
  (event) => {
    if (
      isFallAlertActive &&
      (Math.abs(event.acceleration.x) > accelerationThreshold ||
        Math.abs(event.acceleration.y) > accelerationThreshold ||
        Math.abs(event.acceleration.z) > accelerationThreshold)
    ) {
      isFallAlertActive = false;
      const popupHTML = `
<div class="popup alert">
  <div class="popup-header">
    <h2>¡Caida Detectada!</h2>
  </div>
  <div class="popup-content">
    <p>Hemos detectado una posible caida, y avisaremos a tus personas de contacto en <span class="countdown"></span> segundos.</p>
  </div>
  <hr>
  <div class="popup-footer">
    <button id="cancel-alert">Estoy bien, cancelar alerta</button>
  </div>
</div>`;

      const popupWrapper = document.createElement("div");
      popupWrapper.classList.add("popup-wrapper");
      popupWrapper.innerHTML = popupHTML;

      document.querySelector("body").appendChild(popupWrapper);

      const counter = popupWrapper.querySelector(".countdown");
      let count = 20;
      let isTicking = true;

      function updateCounter() {
        if (isTicking) {
          if (count === 0) {
            debugger;
            fetch(
              "https://backend.myseniorcare.es/notify-all-but-me",
              //"http://localhost:3333/notify-all-but-me",
              {
                method: "GET",
                credentials: "include",
              }
            ).then(() => {});
            isTicking = false;
            isFallAlertActive = true;
          } else {
            count--;
            counter.innerHTML = count;
            setTimeout(updateCounter, 1000);
          }
        }
      }
      updateCounter();

      popupWrapper
        .querySelector("#cancel-alert")
        .addEventListener("click", () => {
          isTicking = false;
          isFallAlertActive = true;
          popupWrapper.style.display = "none";
        });
    }
  },
  false
);
/*
setTimeout(() => {document.querySelector('h2').innerHTML = `JEJEJE`}, 1000);
setTimeout(
  () => {
    let event = new DeviceMotionEvent('devicemotion');
    document.querySelector('h2').innerHTML = `(${event.acceleration.x}, ${event.acceleration.y}, ${event.acceleration.z})`
  },
  2000
);
*/

if (!document.cookie) {
  const uuid = crypto.randomUUID();
  const expiration = new Date(
    new Date().getTime() + 365 * 24 * 60 * 60 * 1000
  ).toUTCString();
  const domain = /(?:[^\.]+\.)?[^.]+$/.exec(location.hostname)[0];
  document.cookie = `id=${uuid};expires=${expiration};domain=${domain};path=/;SameSite=None;Secure`;
}

document.addEventListener("DOMContentLoaded", function () {
  const dropdownLink = document.querySelector("header > nav > a");
  dropdownLink.addEventListener("click", function (event) {
    event.preventDefault();
    const dropdownMenu = document.querySelector("header > nav > ul");
    if (dropdownMenu.style.display === "block") {
      dropdownMenu.style.display = "none";
    } else {
      dropdownMenu.style.display = "block";
    }

    /*
    if (dropdownMenu.classList.contains("hidden")) {
      dropdownMenu.classList.remove("hidden")
    } else {
      dropdownMenu.classList.add("hidden")
    }
    */
  });
});

const publicVapidKey =
  "BDaSJ9mh1KPL4jaXPLxAwZTlr4Xu_sGd5chTgrZAOrGuFmHFWQpkBPEX1alCXXVd6jW7UG1S3MXRf8RMwahJoDs";

async function registerServiceWorker() {
  const register = await navigator.serviceWorker.register(
    "/service_worker.js",
    {
      scope: "/",
    }
  );

  async function askForPushPermission() {
    Notification.requestPermission().then(function (result) {
      if (result === "granted") {
        console.log("Permission granted");
        register.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicVapidKey,
          })
          .then((subscription) => {
            fetch(
              "https://backend.myseniorcare.es/subscribe",
              //"http://localhost:3333/subscribe",
              {
                method: "POST",
                body: JSON.stringify(subscription),
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              }
            ).then(() => {});
          });
      } else {
        console.log("Permission denied");
      }
    });
  }

  async function askForGeolocationPermission() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        alert("<" + position.coords.latitude + "," + position.coords.longitude + ">");
      },
      () => {
        // Handle permission denied or error
        console.error(
          "User denied geolocation permission or an error occurred."
        );
      }
    );
  }

  setTimeout(function () {
    Promise.allSettled([
      navigator.permissions.query({ name: "notifications" }),
      navigator.permissions.query({ name: "geolocation" }),
    ]).then((responses) => {
      const [accepted, pending] = responses.reduce(
        (acc, cur) =>
          cur["value"]["state"] === "prompt"
            ? [acc[0], acc[1].concat(cur["value"]["name"])]
            : cur["value"]["state"] === "granted"
            ? [acc[0].concat(cur["value"]["name"]), acc[1]]
            : acc,
        [[], []]
      );
      if (pending.length) {
        const popupHTML = `
        <div class="popup">
          <div class="popup-header">
            <h2>Activar Notificaciones</h2>
          </div>
          <div class="popup-content">
            <p>Para habilitar un mejor el cuidado proporcionado por SeniorCare, activa ${pending
              .map((permission) =>
                permission === "geolocation"
                  ? "la geolocalización"
                  : "las notificaciones"
              )
              .join(" y ")}.</p>
          </div>
          <hr>
          <div class="popup-footer">
            <button id="allow-button">Activar</button>
            <button class="secondary" id="deny-button">En otro momento</button>
          </div>
        </div>`;

        const popupWrapper = document.createElement("div");
        popupWrapper.classList.add("popup-wrapper");
        popupWrapper.innerHTML = popupHTML;

        document.querySelector("body").appendChild(popupWrapper);

        popupWrapper
          .querySelector("#allow-button")
          .addEventListener("click", () => {
            popupWrapper.style.display = "none";
            if (pending.includes("notifications")) {
              askForPushPermission().then(() => {});
            }
            if (pending.includes("geolocation")) {
              askForGeolocationPermission().then(() => {});
            }
          });

        popupWrapper
          .querySelector("#deny-button")
          .addEventListener("click", () => {
            popupWrapper.style.display = "none";
          });

        popupWrapper.addEventListener("click", (event) => {
          if (event.target === popupWrapper) {
            popupWrapper.style.display = "none";
          }
        });
      }
    });
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  if ("serviceWorker" in navigator) {
    registerServiceWorker().catch(console.log);
  }
});
