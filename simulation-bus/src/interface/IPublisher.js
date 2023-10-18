export default class IPublisher {
  constructor() {
    this.suscribers = [];
  }

  suscribe(suscriber) {
    throw new Error("Abstract method, it has that be implement.");
  }

  notify() {
    throw new Error("Abstract method, it has that be implement.");
  }
}
