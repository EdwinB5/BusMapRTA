from flask import request
from flask_restful import Resource
from src import Base, session
from src.utils.json_wrapper import format_json

class Buses(Resource):
     def __init__(self):
        self.session = session
        self.Municipio = Base.classes.municipio