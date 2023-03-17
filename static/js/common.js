const accelerationThreshold = 15;
const homeCoordinates = [36.739786061885276, -4.554898971493983]; // lat, lon
let currentCoordinates;

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

if (!document.cookie && crypto.randomUUID) {
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
        alert(
          `Estás a ${distance(
            position.coords.latitude,
            position.coords.longitude,
            ...homeCoordinates
          ).toFixed(1)}km de tu casa`
        );
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
            <h2>Activar Permisos</h2>
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

function distance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

let sosButtonFunctionality = "drag";

document.addEventListener("DOMContentLoaded", function () {
  const myButton = document.querySelector("#sos_button");
  let pressTimer;

  myButton.addEventListener("mousedown", longPressStart);
  myButton.addEventListener("touchstart", longPressStart);

  myButton.addEventListener("mouseup", longPressEnd);
  myButton.addEventListener("touchend", longPressEnd);

  function longPressStart(event) {
    if (sosButtonFunctionality === "longPress") {
      event.preventDefault();
      clearInterval(pressTimer);
      pressTimer = window.setInterval(() => {
        clearInterval(pressTimer);
        fetch(
          "https://backend.myseniorcare.es/notify-all-but-me",
          //"http://localhost:3333/notify-all-but-me",
          {
            method: "GET",
            credentials: "include",
          }
        ).then(() => {});
      }, 3000);
    }
  }

  function longPressEnd(event) {
    if (sosButtonFunctionality === "longPress") {
      clearInterval(pressTimer);
      sosButtonFunctionality = "disabled";
      myButton.classList.remove("enabled");
      setTimeout(() => (sosButtonFunctionality = "drag"), 100);
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const clickableElement = document.querySelector("#sos_button > a");
  const movableElement = document.querySelector("#sos_button");

  let draggingStartTime;
  let initialX;
  let initialY;
  let currentX;
  let currentY;
  let xOffset = parseInt(localStorage.getItem("xOffset")) || 0;
  let yOffset = parseInt(localStorage.getItem("yOffset")) || 0;
  setTranslate(xOffset, yOffset, movableElement);

  // Add event listeners for both mouse and touch events
  clickableElement.addEventListener("mousedown", dragStart);
  clickableElement.addEventListener("touchstart", dragStart);
  clickableElement.addEventListener("mouseup", dragEnd);
  clickableElement.addEventListener("touchend", dragEnd);
  clickableElement.addEventListener("mousemove", drag);
  clickableElement.addEventListener("touchmove", drag);

  function dragStart(event) {
    if (sosButtonFunctionality === "drag") {
      event.preventDefault();
      if (event.type === "touchstart") {
        initialX = event.touches[0].clientX - xOffset;
        initialY = event.touches[0].clientY - yOffset;
      } else {
        initialX = event.clientX - xOffset;
        initialY = event.clientY - yOffset;
      }

      if (event.target === clickableElement) {
        draggingStartTime = new Date();
      }
    }
  }

  function drag(event) {
    if (sosButtonFunctionality === "drag") {
      if (new Date() - draggingStartTime >= 200) {
        event.preventDefault();
        if (event.type === "touchmove") {
          xOffset = event.touches[0].clientX - initialX;
          yOffset = event.touches[0].clientY - initialY;
        } else {
          xOffset = event.clientX - initialX;
          yOffset = event.clientY - initialY;
        }

        setTranslate(xOffset, yOffset, movableElement);
        localStorage.setItem("xOffset", xOffset);
        localStorage.setItem("yOffset", yOffset);
      }
    }
  }

  function dragEnd(event) {
    if (sosButtonFunctionality === "drag") {
      if (new Date() - draggingStartTime < 200) {
        sosButtonFunctionality = "disabled";
        movableElement.classList.add("enabled");
        setTimeout(() => (sosButtonFunctionality = "longPress"), 100);
      } else {
        event.preventDefault();
      }
      initialX = currentX;
      initialY = currentY;

      draggingStartTime = null;
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }
});
