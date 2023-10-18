from shapely.geometry import MultiPolygon, Point
from shapely.wkb import loads
from shapely.geometry import mapping


def load_multipolygon(wkb_str):
    extension_bytes = bytes.fromhex(wkb_str)
    geometry = MultiPolygon(loads(extension_bytes))
    coords_list = multipolygon_list(geometry)
    return coords_list


def load_point(wkb_str):
    location_bytes = bytes.fromhex(wkb_str)
    point = Point(loads(location_bytes))
    return [point.x, point.y]


def array_to_multipolygon(array):
    geometry = MultiPolygon(array)
    coords_list = multipolygon_list(geometry)
    return coords_list


def multipolygon_list(geometry):
    return [[list(coord) for coord in poly.exterior.coords] for poly in list(geometry.geoms)]
