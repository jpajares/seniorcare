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
