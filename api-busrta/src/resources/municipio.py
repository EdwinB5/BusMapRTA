from flask import request
from flask_restful import Resource
from src import Base, session
from src.utils.geometry import wkb_to_multipolygon, wkb_to_point
from src.utils.json_wrapper import format_json


class Municipios(Resource):
    def __init__(self):
        self.session = session
        self.Municipio = Base.classes.municipio

    @format_json
    def get(self):
        param = request.args.get('aparcadero')
        results = []

        try:
            query = self.session.query(self.Municipio)
        except Exception:
            return ("The requested operation cannot be executed at this time.", 500)

        if param and param.lower() == 'true':
            query = query.filter(self.Municipio.tiene_aparcadero)

        for municipio in query.all():
            result = {}
            columns = municipio.__table__.columns.keys()

            for key in columns:
                if key == 'extension':
                    result[key] = wkb_to_multipolygon(
                        str(getattr(municipio, key))).wkt
                elif key == 'localizacion' and getattr(municipio, key) is not None:
                    result[key] = wkb_to_point(
                        str(getattr(municipio, key))).wkt
                else:
                    result[key] = str(getattr(municipio, key))

            results.append(result)
        return (results, 200)
