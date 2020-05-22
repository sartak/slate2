import { BaseSystem } from './base';

export class UserDefinedSystem extends BaseSystem {
  userDefined = true;

  constructor(config) {
    super();

    Object.entries(config).forEach(([key, value]) => {
      this[key] = value;
    });
  }
}
