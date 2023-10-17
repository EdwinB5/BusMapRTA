from shapely.geometry import MultiPolygon, Point, Polygon
from shapely.wkb import loads


def wkb_to_multipolygon(wkb_str):
    extension_bytes = bytes.fromhex(wkb_str)
    return MultiPolygon(loads(extension_bytes))


def wkb_to_point(wkb_str):
    location_bytes = bytes.fromhex(wkb_str)
    return Point(loads(location_bytes))


def array_to_multipolygon(array):
    return str(MultiPolygon(array))
