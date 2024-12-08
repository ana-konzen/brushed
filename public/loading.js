function alternateLoading() {
  const loadingMessage = document.querySelector("#loading-message");

  const loadingMessages = [
    "analyzing your song",
    "choosing paint brushes",
    "picking the right colors",
    "adding the final touches",
    "creating your masterpiece",
  ];
  let currentMessage = 0;
  setInterval(() => {
    currentMessage++;
    loadingMessage.innerHTML = loadingMessages[currentMessage % loadingMessages.length];
  }, 2000);
}
