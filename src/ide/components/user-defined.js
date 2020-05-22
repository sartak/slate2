import { BaseComponent } from './base';

export class UserDefinedComponent extends BaseComponent {
  userDefined = true;

  constructor(config) {
    super();

    Object.entries(config).forEach(([key, value]) => {
      this[key] = value;
    });
  }
}
