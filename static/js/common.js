const accelerationThreshold = 15;
window.addEventListener(
  "devicemotion",
  (event) => {
    if (
      Math.abs(event.acceleration.x) > accelerationThreshold ||
      Math.abs(event.acceleration.y) > accelerationThreshold ||
      Math.abs(event.acceleration.z) > accelerationThreshold
    ) {
      alert(`¡¿Te has caido?! (${event.acceleration.x}, ${event.acceleration.y}, ${event.acceleration.z})`);
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

document.addEventListener('DOMContentLoaded', function() {
  const dropdownLink = document.querySelector("header > nav > a");
  dropdownLink.addEventListener("click", function(event) {
    event.preventDefault();
    const dropdownMenu = document.querySelector("header > nav > ul");
     if (dropdownMenu.style.display === 'block') {
      dropdownMenu.style.display = 'none';
    } else {
      dropdownMenu.style.display = 'block';
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


const publicVapidKey = "BDaSJ9mh1KPL4jaXPLxAwZTlr4Xu_sGd5chTgrZAOrGuFmHFWQpkBPEX1alCXXVd6jW7UG1S3MXRf8RMwahJoDs"

async function registerServiceWorker() {
    const register = await navigator.serviceWorker.register("/service_worker.js", {
        scope: "/"
    });

    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey,
    });

    await fetch("https://expressjs-postgres-production-3bb5.up.railway.app/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
            "Content-Type": "application/json",
        }
    })
}

if("serviceWorker" in navigator) {
    registerServiceWorker().catch(console.log)
}



