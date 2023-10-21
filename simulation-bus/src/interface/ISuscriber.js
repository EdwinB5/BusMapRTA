export default class ISuscriber {
  constructor() {}

  update(data) {
    throw new Error("Abstract method, it has that be implement.");
  }
}