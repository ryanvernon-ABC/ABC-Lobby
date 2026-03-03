(function attachInactivityTimeout() {
  const timeoutSeconds = 30;
  const redirectPath = '/';

  let inactivityTimer;

  function resetTimer() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    inactivityTimer = setTimeout(() => {
      window.location.href = redirectPath;
    }, timeoutSeconds * 1000);
  }

  const events = ['click', 'touchstart', 'keydown', 'mousemove', 'scroll'];
  events.forEach((eventName) => {
    window.addEventListener(eventName, resetTimer, { passive: true });
  });

  resetTimer();
})();
