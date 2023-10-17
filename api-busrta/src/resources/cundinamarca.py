from flask_restful import Resource
from src.utils.json_wrapper import format_json
from src.utils.geometry import array_to_multipolygon
import json

class Cundinamarca(Resource):
    def __init__(self):
        self.data = None
        with open('src/data/cundinamarca.json', 'r') as file:
            self.data = json.load(file)
    
    @format_json
    def get(self):
        result = self.data['geometry']['coordinates']
        result = {"departamento": self.data['properties']["NAME_1"],
                  "extension": array_to_multipolygon(self.data['geometry']['coordinates'])}
        return result