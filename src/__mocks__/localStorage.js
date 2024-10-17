// ./src/__mocks__/localStorage.js

export const localStorageMock = (function() {
  let store = {
    user: JSON.stringify({ email: "test@example.com" }), // Mock user data
  };
  return {
    getItem: function(key) {
      return store[key] || null; // Return null if key is not found
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  }
})();
