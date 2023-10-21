export default class IPublisher {
  constructor() {
    this.suscribers = [];
  }

  subscribe(suscriber) {
    throw new Error("Abstract method, it has that be implement.");
  }

  notify() {
    throw new Error("Abstract method, it has that be implement.");
  }
}
