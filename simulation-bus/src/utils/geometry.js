import wkx from "wkx";

/**
 * 
 * @param {*} geometry_hex 
 * @returns return geometry in format GeoJSON
 */
export function HexFromGeometry(geometry_hex) {
  return wkx.Geometry.parse(Buffer.from(geometry_hex, "hex")).toGeoJSON();
}
