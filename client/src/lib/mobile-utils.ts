export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },
  
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30, 50, 30]);
    }
  },
  
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

export const canInstallPWA = () => {
  return 'serviceWorker' in navigator && !isStandalone();
};
