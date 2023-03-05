const accelerationThreshold = 15;
window.addEventListener(
  "devicemotion",
  (event) => {
    if (
      Math.abs(event.acceleration.x) > accelerationThreshold ||
      Math.abs(event.acceleration.y) > accelerationThreshold ||
      Math.abs(event.acceleration.z) > accelerationThreshold
    ) {
      alert(
        `¡¿Te has caido?! (${event.acceleration.x}, ${event.acceleration.y}, ${event.acceleration.z})`
      );
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

  async function askForPermission() {
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

  setTimeout(function () {
    if (Notification.permission === "default") {
      const popupHTML = `
          <div class="popup" style="position: absolute; top: 25%; left: 10%; right: 10%">
            <h2>Grant Permission</h2>
            <p>This site would like to send you push notifications. Click Allow to grant permission.</p>
            <button id="allow-button">Allow</button>
            <button id="deny-button">Deny</button>
          </div>
        `;

      const popupContainer = document.createElement("div");
      popupContainer.innerHTML = popupHTML;
      document.querySelector("body").appendChild(popupContainer);

      popupContainer
        .querySelector("#allow-button")
        .addEventListener("click", () => {
          popupContainer.style.display = "none";
          askForPermission().then(() => {});
        });

      popupContainer
        .querySelector("#deny-button")
        .addEventListener("click", () => {
          popupContainer.style.display = "none";
        });
    }
  }, 5000);
}

document.addEventListener("DOMContentLoaded", function () {
  if ("serviceWorker" in navigator) {
    registerServiceWorker().catch(console.log);
  }
});
