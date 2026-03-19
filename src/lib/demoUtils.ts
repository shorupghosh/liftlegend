const DEMO_MODE_KEY = 'liftlegend_demo_mode';
const DEMO_MODE_EVENT = 'liftlegend:demo-mode-change';

export const isDemoModeActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(DEMO_MODE_KEY) === 'true' || window.location.pathname.startsWith('/demo');
};

export const setDemoMode = (active: boolean): void => {
  if (typeof window === 'undefined') return;
  if (active) {
    window.sessionStorage.setItem(DEMO_MODE_KEY, 'true');
  } else {
    window.sessionStorage.removeItem(DEMO_MODE_KEY);
  }
  window.dispatchEvent(new CustomEvent(DEMO_MODE_EVENT, { detail: active }));
};

export const enterDemoMode = () => {
  setDemoMode(true);
  window.location.href = '/demo';
};

export const exitDemoMode = () => {
  setDemoMode(false);
  window.location.href = '/';
};

export const onDemoModeChange = (callback: (active: boolean) => void) => {
  const handler = (event: Event) => {
    callback(Boolean((event as CustomEvent<boolean>).detail));
  };

  window.addEventListener(DEMO_MODE_EVENT, handler);
  return () => window.removeEventListener(DEMO_MODE_EVENT, handler);
};
