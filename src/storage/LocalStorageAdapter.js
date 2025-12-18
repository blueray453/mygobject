export const LocalStorageAdapter = {
    getItem: k => localStorage.getItem(k),
    setItem: (k, v) => localStorage.setItem(k, v)
};