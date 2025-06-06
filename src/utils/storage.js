const STORAGE_KEY = 'draftOverlayState';
const DEFAULT_DRAFT_ORDER_KEY = 'defaultDraftOrder';
const DEFAULT_TIMER_DURATION_KEY = 'defaultTimerDuration';

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Save state to localStorage with debouncing
export const saveState = debounce((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}, 50);

// Add flush on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  });
}

// Load state from localStorage
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return null;
  }
};

// Clear state from localStorage
export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing state from localStorage:', err);
  }
};

// Save default draft order
export const saveDefaultDraftOrder = (draftOrder) => {
  try {
    localStorage.setItem(DEFAULT_DRAFT_ORDER_KEY, JSON.stringify(draftOrder));
  } catch (err) {
    console.error('Error saving default draft order:', err);
  }
};

// Load default draft order
export const loadDefaultDraftOrder = () => {
  try {
    const savedOrder = localStorage.getItem(DEFAULT_DRAFT_ORDER_KEY);
    return savedOrder ? JSON.parse(savedOrder) : null;
  } catch (err) {
    console.error('Error loading default draft order:', err);
    return null;
  }
};

// Save default timer duration
export const saveDefaultTimerDuration = (duration) => {
  try {
    localStorage.setItem(DEFAULT_TIMER_DURATION_KEY, duration.toString());
  } catch (err) {
    console.error('Error saving default timer duration:', err);
  }
};

// Load default timer duration
export const loadDefaultTimerDuration = () => {
  try {
    const savedDuration = localStorage.getItem(DEFAULT_TIMER_DURATION_KEY);
    return savedDuration ? parseInt(savedDuration, 10) : null;
  } catch (err) {
    console.error('Error loading default timer duration:', err);
    return null;
  }
};
