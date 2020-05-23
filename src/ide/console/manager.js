export class ConsoleManager {
  lines = [];
  originalMethod = {};
  novelMethods = [];
  subscriptions = [];

  attach() {
    const { lines, novelMethods, originalMethod } = this;
    const manager = this;

    ['trace', 'debug', 'log', 'info', 'warn', 'error'].forEach((level) => {
      const original = originalMethod[level] = console[level];
      console[level] = function (...args) {
        lines.push([level, args]);
        manager.subscriptions.forEach((cb) => cb(level, args));
        return original(...args);
      };
    });

    const { log: originalLog } = this.originalMethod;

    ['success'].forEach((level) => {
      novelMethods.push(level);
      console[level] = function (...args) {
        lines.push([level, args]);
        manager.subscriptions.forEach((cb) => cb(level, args));
        return originalLog(...args);
      };
    });

    ['slate2_input', 'slate2_result'].forEach((level) => {
      novelMethods.push(level);
      console[level] = function (...args) {
        lines.push([level, args]);
        manager.subscriptions.forEach((cb) => cb(level, args));
      };
    });

    return this;
  }

  detach() {
    Object.entries(this.originalMethod).forEach(([name, implementation]) => {
      console[name] = implementation;
    });

    this.novelMethods.forEach((name) => {
      delete console[name];
    });

    this.originalMethod = {};
    this.novelMethods = [];

    return this;
  }

  subscribe(callback) {
    this.subscriptions = [...this.subscriptions, callback];
    return () => {
      this.unsubscribe(callback);
    };
  }

  unsubscribe(callback) {
    this.subscriptions = this.subscriptions.filter((cb) => cb !== callback);
  }
}

if (module.hot) {
  ConsoleManager.prototype._hotReplace = function (next) {
    this.detach();

    // @Cleanup this doesn't allow unsubscribe since `this` will be the wrong
    // object. Maybe have unsubscribe look it up, but only in HMR.
    next.subscriptions = this.subscriptions;
    next.lines = this.lines;

    next.attach();

    this._hotReplaceContext(next);
  };
}
