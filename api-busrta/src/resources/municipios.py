from flask import request
from flask_restful import Resource
from src import Base, session
from src.utils.geojson import municipio_geojson
from src.utils.geometry import load_multipolygon, load_point
from src.utils.json_wrapper import format_json


class Municipios(Resource):
    def __init__(self):
        self.session = session
        self.Municipio = Base.classes.municipio

    @format_json
    def get(self):
        aparcadero = request.args.get('aparcadero')
        nombre_municipio = request.args.get('nombre')
        municipio_id = request.args.get('id')

        method = 'all'

        try:
            query = self.session.query(self.Municipio)
        except Exception:
            return ("The requested operation cannot be executed at this time.", 500)

        if aparcadero and aparcadero.lower() == 'true':
            query = query.filter(self.Municipio.tiene_aparcadero)

        if nombre_municipio:
            query = query.filter_by(nombre=nombre_municipio)
            method = 'first'

        if municipio_id and type(municipio_id) == int:
            query = query.filter_by(id=municipio_id)
            method = 'first'

        query = query.all() if method == 'all' else [query.first()]

        if query[0] == None:
            return ("Municipios resource not found.", 404)

        results = []
        columns = self.Municipio.__table__.columns.keys()

        for municipio in query:
            result = {}

            for key in columns:
                if key == 'extension':
                    result[key] = load_multipolygon(
                        str(getattr(municipio, key)))
                elif key == 'localizacion' and getattr(municipio, key) is not None:
                    result[key] = load_point(
                        str(getattr(municipio, key)))
                else:
                    result[key] = getattr(municipio, key)

            results.append(result)

        geojson = municipio_geojson(results)
        return geojson


class MunicipioUpdate(Resource):
    def __init__(self):
        self.session = session
        self.Municipio = Base.classes.municipio

    @format_json
    def put(self):
        nombre = request.args.get('nombre')
        municipio_id = request.args.get('id')
        data = request.get_json()
        try:
            if nombre:
                municipio = self.session.query(
                    self.Municipio).filter_by(nombre=nombre).first()
            elif municipio_id:
                municipio = self.session.query(
                    self.Municipio).filter_by(id=municipio_id).first()
            else:
                return ("Insufficient parameters", 400)

            if municipio is None:
                return ("Municipality not found", 404)

            for key, value in data.items():
                if key == 'tiene_aparcadero':
                    setattr(municipio, key, bool(eval(value)))
                else:
                    setattr(municipio, key, value)

            self.session.commit()
            return ("Municipality successfully modified", 200)
        except Exception as error:
            self.session.rollback()
            print(str(error))
            return ("Error while modifying the municipality", 500)
