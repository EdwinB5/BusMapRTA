export default class ISuscriber {
  constructor() {}

  async update(data) {
    throw new Error("Abstract method, it has that be implement.");
  }
}