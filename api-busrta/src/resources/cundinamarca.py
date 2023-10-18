from flask_restful import Resource
from src.utils.json_wrapper import format_json
from src.utils.geometry import array_to_multipolygon
from src.utils.geojson import departamento_geojson
import json

class Cundinamarca(Resource):
    def __init__(self):
        self.data = None
        with open('src/data/cundinamarca.json', 'r') as file:
            self.data = json.load(file)
    
    @format_json
    def get(self):
        """
        Retrieves the geometry data for a Cundinamarca.

        Returns the department's name and coordinates in GeoJSON format.

        ---
        tags:
            - Cundinamarca
        responses:
            200:
                description: The department's geometry data in GeoJSON format.
    """
        result = self.data['geometry']['coordinates']
        result = {"departamento": self.data['properties']["NAME_1"],
                  "extension": array_to_multipolygon(self.data['geometry']['coordinates'])}
        
        geojson = departamento_geojson(result)
        return geojson