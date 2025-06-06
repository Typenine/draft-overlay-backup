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

const MAX_SAFE_QUOTA = 4 * 1024 * 1024; // 4MB safe threshold

export const checkStorageAvailability = () => {
  try {
    const storage = window.localStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

export const getStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length;
    }
  }
  return total;
};

// Save state to localStorage with debouncing
export const saveState = debounce((state) => {
  if (!checkStorageAvailability()) {
    console.warn('⚠️ localStorage is not available — draft progress will not persist.');
    return;
  }

  try {
    const stateString = JSON.stringify(state);
    const projectedSize = getStorageUsage() + stateString.length;

    if (projectedSize > MAX_SAFE_QUOTA) {
      console.warn('⚠️ Storage usage nearing safe limit (4MB). Consider clearing old draft history.');
    }

    localStorage.setItem(STORAGE_KEY, stateString);
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.error('❌ Storage quota exceeded — unable to save draft state.');
    } else {
      console.error('❌ Error saving draft state:', err);
    }
  }
}, 50);

// Add flush on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (!checkStorageAvailability()) {
      return;
    }
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('❌ Error flushing state on unload:', err);
      }
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
