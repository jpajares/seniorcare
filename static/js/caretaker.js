document.addEventListener("DOMContentLoaded", function () {
    inputContainer = document.querySelector(".input-container");
    messageInput = document.querySelector("textarea");
    sendButton = document.querySelector("button");
  
    sendButton.addEventListener("click", function () {
      const message = messageInput.value;
      if (message) {
        const newMessage = document.createElement("div");
        newMessage.classList.add("message", "user");
        newMessage.innerHTML =
          '<div class="message-time"></div><div class="message-text"></div>';
        newMessage.querySelector(".message-time").textContent =
          new Date().toLocaleTimeString("es-ES", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
        newMessage.querySelector(".message-text").textContent = message;
        inputContainer.insertAdjacentElement("afterend", newMessage);
        messageInput.value = "";
        fetch(
          "https://backend.myseniorcare.es/chat",
          // "http://localhost:3333/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: message,
            }),
            credentials: "include",
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
          })
          .catch((error) => {
            console.error(`Error sending message: ${error}`);
          });
      }
    });
  
    eventSource = new EventSource(
      "https://backend.myseniorcare.es/chat"
      // "http://localhost:3333/chat"
    );
  
    eventSource.onmessage = function (event) {
      const { message, userid } = JSON.parse(event.data);
      if (userid !== /id ?= ?([0-9a-f-]+)/.exec(document.cookie)[1]) {
        const newMessage = document.createElement("div");
        newMessage.classList.add("message", "response");
        newMessage.innerHTML =
          '<div class="message-text"></div><div class="message-time"></div>';
        newMessage.querySelector(".message-time").textContent =
          new Date().toLocaleTimeString("es-ES", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
        newMessage.querySelector(".message-text").textContent = message;
        inputContainer.insertAdjacentElement("afterend", newMessage);
      }
    };
    //eventSource.close()
  });
  