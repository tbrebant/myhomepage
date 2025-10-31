class SettingsManager {
  constructor (prefix = 'app-settings') {
    this.prefix = prefix;
    this.storage = this.resolveStorage();
  }

  resolveStorage () {
    try {
      const storage = window.localStorage;
      const probeKey = this.buildKey('__probe__');
      storage.setItem(probeKey, '1');
      storage.removeItem(probeKey);
      return storage;
    } catch (error) {
      console.warn('LocalStorage unavailable, settings will not persist.', error);
      return null;
    }
  }

  buildKey (key) {
    return `${this.prefix}:${key}`;
  }

  get (key, defaultValue = null) {
    if (!this.storage) return defaultValue;
    try {
      const rawValue = this.storage.getItem(this.buildKey(key));
      return rawValue !== null ? JSON.parse(rawValue) : defaultValue;
    } catch (error) {
      console.warn(`Failed to read setting "${key}".`, error);
      return defaultValue;
    }
  }

  set (key, value) {
    if (!this.storage) return;
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(this.buildKey(key), serialized);
    } catch (error) {
      console.warn(`Failed to save setting "${key}".`, error);
    }
  }
}