document.addEventListener("DOMContentLoaded", function () {
  const nextTurnButton = document.querySelector("#next-turn");
  const timeTextElement = document.querySelector("#medication-time");
  nextTurnButton.addEventListener("click", (event) => {
    event.target.parentElement.style.display = "none";
    localStorage.removeItem("pendingPills");
    checkPendingPills();
    timeTextElement.textContent = `Próxima toma a las ${String(
      ((Math.floor((new Date().getHours() + 1) / 8) + 1) * 8 + 23) % 24
    ).padStart(2, "0")}:00`;
  });
  let pendingPills = localStorage.getItem("pendingPills");

  if (pendingPills === null) {
    timeTextElement.textContent = `Próxima toma a las ${String(
      ((Math.floor((new Date().getHours() + 1) / 8) + 1) * 8 + 23) % 24
    ).padStart(2, "0")}:00`;
  } else {
    timeTextElement.textContent = `Toma de las ${String(
      (Math.floor((new Date().getHours() + 1) / 8) * 8 + 23) % 24
    ).padStart(2, "0")}:00 pendiente`;
    if (pendingPills === "") {
      nextTurnButton.style.display = "block";
    }
  }
  for (let pillButton of document.querySelectorAll(
    ".medication-grid > .big-button"
  )) {
    pillButton.addEventListener("click", (event) => {
      const pendingPills = localStorage.getItem("pendingPills") || "";
      const pendingPillsList = pendingPills.length
        ? pendingPills.split(",")
        : [];
      const buttonClassSelector =
        "." +
        event.target.classList
          .toString()
          .split(" ")
          .filter((className) => className !== "pending")
          .join(".");
      if (event.target.classList.contains("pending")) {
        event.target.classList.remove("pending");
        const newPendingPills = pendingPillsList
          .filter((className) => className !== buttonClassSelector)
          .join(",");
        localStorage.setItem("pendingPills", newPendingPills);
        if (newPendingPills === "") {
          nextTurnButton.style.display = "block";
        }
      } else {
        event.target.classList.add("pending");
        timeTextElement.textContent = `Toma de las ${String(
          (Math.floor((new Date().getHours() + 1) / 8) * 8 + 23) % 24
        ).padStart(2, "0")}:00 pendiente`;
        if (pendingPills === "") {
          nextTurnButton.style.display = "block";
        }
        localStorage.setItem(
          "pendingPills",
          pendingPillsList.concat(buttonClassSelector).join(",")
        );
        nextTurnButton.style.display = "none";
      }
      checkPendingPills();
    });
    const buttonClassSelector =
      "." + pillButton.classList.toString().split(" ").join(".");
    if ((pendingPills || "").includes(buttonClassSelector)) {
      pillButton.classList.add("pending");
    }
  }
});
