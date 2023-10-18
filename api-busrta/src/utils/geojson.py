def municipio_geojson(municipios):
    geojson_list = []
    
    for municipio in municipios:
        geojson = {
            "type": "Feature",
            "properties": {
                "nombre": municipio["nombre"],
                "buses_disponibles": municipio["buses_disponibles"],
                "buses_no_disponibles": municipio["buses_no_disponibles"],
                "capacidad_actual": municipio["capacidad_actual"],
                "capacidad_maxima": municipio["capacidad_maxima"],
                "id": municipio["id"],
                "aparcadero": municipio["tiene_aparcadero"]    
            },
            "geometry": {
                "type": "GeometryCollection",
                "geometries": [
                    {
                        "type": "Point",
                        "coordinates": municipio["localizacion"]
                    },
                    {
                        "type": "MultiPolygon",
                        "coordinates": municipio["extension"]
                    }
                ]
            }
        }
        geojson_list.append(geojson)
    
    return geojson_list

def departamento_geojson(departamento):
    geojson = {
            "type": "Feature",
            "properties": {
                "nombre": departamento["departamento"],  
            },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": departamento["extension"],
            }
        }
    return geojson
