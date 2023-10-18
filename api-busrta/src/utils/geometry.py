from shapely.geometry import MultiPolygon, Point
from shapely.wkb import loads
from shapely.geometry import mapping


def load_multipolygon(wkb_str):
    """
    Carga un objeto multipolígono a partir de una cadena WKB (Well-Known Binary).

    Args:
        wkb_str (str): Cadena WKB que representa el objeto multipolígono.

    Returns:
        list: Lista de coordenadas que representan el objeto multipolígono.
    """
    extension_bytes = bytes.fromhex(wkb_str)
    geometry = MultiPolygon(loads(extension_bytes))
    coords_list = multipolygon_list(geometry)
    return coords_list


def load_point(wkb_str):
    """
    Carga un punto a partir de una cadena WKB (Well-Known Binary).

    Args:
        wkb_str (str): Cadena WKB que representa el punto.

    Returns:
        list: Lista de coordenadas [x, y] que representan el punto.
    """
    location_bytes = bytes.fromhex(wkb_str)
    point = Point(loads(location_bytes))
    return [point.x, point.y]


def array_to_multipolygon(array):
    """
    Convierte un array en un objeto multipolígono.

    Args:
        array (list): Lista de objetos que se convertirán en el multipolígono.

    Returns:
        list: Lista de coordenadas que representan el objeto multipolígono.
    """
    geometry = MultiPolygon(array)
    coords_list = multipolygon_list(geometry)
    return coords_list


def multipolygon_list(geometry):
    """
    Convierte un objeto multipolígono en una lista de coordenadas.

    Args:
        geometry (MultiPolygon): Objeto multipolígono a convertir.

    Returns:
        list: Lista de coordenadas que representan el objeto multipolígono.
    """
    return [[list(coord) for coord in poly.exterior.coords] for poly in list(geometry.geoms)]
