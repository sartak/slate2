export class AlertManager {
  constructor(alerts, setState, nextId = 1) {
    this.alerts = alerts;
    this.setAlerts = setState;
    this.nextId = nextId;
  }

  alert(type, message, options) {
    const id = this.nextId++;

    const dismissTimeout = setTimeout(() => {
      this.dismissAlerts([id]);
    }, 10000)

    const alert = {
      ...options,
      message,
      id,
      type,
      dismissTimeout,
    };

    this.alerts = [...this.alerts, alert];
    this.setAlerts(this.alerts);

    return alert;
  }

  success(message, options) {
    return this.alert('success', message, options);
  }

  warning(error, options) {
    const message = typeof error === 'string' ? error : error.toString();
    return this.alert('warning', message, options);
  }

  error(error, options) {
    const message = typeof error === 'string' ? error : error.toString();
    return this.alert('error', message, options);
  }

  dismissAlerts(ids, options = {}) {
    const { immediately } = options;

    let keep = [];
    let dismiss = [];

    this.alerts.forEach((alert) => {
      if (ids.find((id) => id === alert.id)) {
        dismiss.push(alert);
      } else {
        keep.push(alert);
      }
    });

    if (immediately) {
      this.alerts = keep;
    } else {
      dismiss.forEach((alert) => {
        clearTimeout(alert.dismissTimeout);
        if (alert.setHeight) {
          alert.setHeight(0);
        }
        alert.cleanupTimeout = setTimeout(() => {
          this.dismissAlerts([alert.id], { immediately: true });
        }, 2000);
      });
    }

    this.setAlerts(this.alerts);
  }

  provideSetHeight(id, setHeight) {
    const alert = this.alerts.find((alert) => alert.id === id);
    if (!alert) {
      return;
    }

    if (alert.setHeight) {
      return;
    }

    alert.setHeight = setHeight;
    this.alerts = [...this.alerts];
    this.setAlerts(this.alerts);
  }

  dismissCategory(category, options) {
    const alerts = this.alerts.filter(({ category: c}) => c === category);
    this.dismissAlerts(alerts.map(({ id }) => id), options);
  }
}

if (module.hot) {
  AlertManager.prototype._hotReplace = function (next) {
    next.alerts = this.alerts;
    next.setAlerts = this.setAlerts;
    next.nextId = this.nextId;
    this._hotReplaceContext(next);
  };
}
