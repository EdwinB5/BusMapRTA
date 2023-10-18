from flask import request
from flask_restful import Resource
from src import Base, session
from src.utils.json_wrapper import format_json
from src.utils.geometry import load_point, linestring_to_wkt
import requests

import random


class Buses(Resource):
    def __init__(self):
        self.session = session
        self.Buses = Base.classes.bus
        self.Municipio = Base.classes.municipio

    @format_json
    def get(self):
        data = []
        method = 'all'
        bus_id = request.args.get('id')
        try:
            bus_id = int(bus_id)
        except:
            return (f"The id {bus_id} is not a number (int)", 400)

        try:
            query = self.session.query(self.Buses)
        except Exception:
            return ("The requested operation cannot be executed at this time.", 500)

        if bus_id and isinstance(bus_id, int):
            query = query.filter_by(id=bus_id)
            method = 'filter'

        query = query.all() if method == 'all' else [query.first()]

        if query[0] == None:
            return ("Bus resource not found.", 404)

        for bus in query:
            bus_data = {key: getattr(bus, key)
                        for key in bus.__table__.columns.keys()}
            if 'localizacion' in bus_data and bus_data['localizacion'] is not None:
                bus_data['localizacion'] = load_point(
                    str(bus_data['localizacion']))
            data.append(bus_data)
        return data

    @format_json
    def post(self):
        json_data = request.get_json()

        if not json_data:
            return ("Not data provided.", 400)

        try:
            municipio_origen = self.session.query(
                self.Municipio).filter_by(id=json_data['origen']).first()
            municipio_destino = self.session.query(
                self.Municipio).filter_by(id=json_data['destino']).first()
        except Exception as error:
            return (f'Not origen/destino founded, error: {error}', 400)

        try:
            latitud_origen, longitud_origen = load_point(
                str(municipio_origen.localizacion))
            latitud_destino, longitud_destino = load_point(
                str(municipio_destino.localizacion))
        except Exception as error:
            return (f'Not origen/destino has aparcadero, error {error}.', 400)
        

        if municipio_origen.capacidad_maxima > municipio_origen.capacidad_actual:
            municipio_origen.capacidad_actual += 1
            
            try:
                url = f"http://router.project-osrm.org/route/v1/driving/{longitud_origen},{latitud_origen};{longitud_destino},{latitud_destino}?overview=full&geometries=geojson"
                response = requests.get(url)
                data = response.json()
                
                ruta = data['routes'][0]
                distancia = ruta['distance']
                geometry = linestring_to_wkt(ruta['geometry']['coordinates'])
            except Exception:
                return ('Something went wrong with open street map.', 500)

            json_data['localizacion'] = municipio_origen.localizacion
            json_data['cupos_actuales'] = random.randint(1, json_data['cupos_maximos'])
            json_data['estado'] = 'aparcado'
            json_data['velocidad_promedio'] = random.randint(60, 80)
            json_data['ruta'] = geometry
            json_data['distancia_viaje'] = distancia

            try:
                bus = self.Buses(**json_data)
                self.session.add(bus)
                self.session.commit()
            except Exception as error:
                self.session.rollback()
                return (f'Unexpected added bus error: {error}', 400)

            return 'Bus added succesfully.'
        else:
            return (f'The municio aparcadero {municipio_origen.nombre} is full', 400)

    @format_json
    def put(self):
        json_data = request.get_json()

        if not json_data:
            return ("No data provided.", 400)

        try:
            bus_id = json_data.get('id')
            bus = self.session.query(self.Buses).filter_by(id=bus_id).first()
            if not bus:
                return (f'Bus with id {bus_id} not found.', 404)
        except Exception as error:
            return (f'Error while querying bus: {error}', 400)

        try:
            municipio_origen = self.session.query(
                self.Municipio).filter_by(id=json_data['origen']).first()
        except Exception as error:
            return (f'Not origen/destino founded, error: {error}', 400)

        if municipio_origen.capacidad_maxima > municipio_origen.capacidad_actual:
            try:
                if 'origen' in json_data:
                    bus.origen = json_data['origen']

                if 'fecha_salida' in json_data:
                    bus.fecha_salida = json_data['fecha_salida']

                if 'fecha_entrada' in json_data:
                    bus.fecha_entrada = json_data['fecha_entrada']

                if 'destino' in json_data:
                    bus.destino = json_data['destino']
                self.session.commit()
            except Exception as error:
                return (f'Error while updating bus: {error}', 400)

            return 'Bus updated successfully.'
        else:
            return (f'The municio aparcadero {municipio_origen.nombre} is full', 400)
