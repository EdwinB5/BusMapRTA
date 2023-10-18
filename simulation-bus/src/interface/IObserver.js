export default class ISuscriber {
  constructor() {}

  update(data, i) {
    throw new Error("Abstract method, it has that be implement.");
  }
}