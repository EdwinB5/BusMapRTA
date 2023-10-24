import wkx from "wkx";

describe("Testing WKX", () => {
  test("Testing WKX", () => {
    let localizacion_binary = "010100000043739D465ADA1540E4839ECDAA9552C0";
    let localizacion = wkx.Geometry.parse(
      Buffer.from(localizacion_binary, "hex")
    
    ).toGeoJSON();
    console.log(localizacion);
  });
});
