export class ConsoleManager {
  lines = [];
  originalMethod = {};
  novelMethods = [];
  subscriptions = [];

  attach() {
    const { lines, novelMethods, originalMethod } = this;
    const manager = this;

    const filter = ([first, second, third]) => {
      if (first.startsWith && first.startsWith('[HMR] ')) {
        return false;
      }

      if (third && third.includes && third.includes('This warning will not show up')) {
        return false;
      }

      return true;
    };

    ['trace', 'debug', 'log', 'info', 'warn', 'error'].forEach((level) => {
      const original = originalMethod[level] = console[level];
      console[level] = function (...args) {
        if (filter(args)) {
          lines.push([level, args]);
          manager.subscriptions.forEach((cb) => cb(level, args));
        }
        return original(...args);
      };
    });

    const { log: originalLog } = this.originalMethod;

    ['success'].forEach((level) => {
      novelMethods.push(level);
      console[level] = function (...args) {
        if (filter(args)) {
          lines.push([level, args]);
          manager.subscriptions.forEach((cb) => cb(level, args));
        }
        return originalLog(...args);
      };
    });

    ['s2_eval_input', 's2_eval_result', 's2_eval_error'].forEach((level) => {
      novelMethods.push(level);
      console[level] = function (...args) {
        // We intentionally don't filter these because they don't go to
        // the browser's console.
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
