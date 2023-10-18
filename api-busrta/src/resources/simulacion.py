from flask import request
from flask_restful import Resource
from src import Base, session
from src.utils.json_wrapper import format_json

class Simulacion(Resource):
    def __init__(self):
        self.session = session
        self.Simulacion = Base.classes.simulacion
        
    @format_json
    def get(self):
        data = []
        try:
            results = self.session.query(self.Simulacion).all()
        except Exception:
            return ("The requested operation cannot be executed at this time.", 500)
        
        for row in results:
            data.append({key: getattr(row, key) for key in row.__table__.columns.keys()})
        return data
    
    
    @format_json
    def put(self):
        simulacion_id = request.args.get('id')
        data = request.get_json()
        if data is None:
            return ("Not data provied to update simulation", 400)
        
        try:
            simulacion = self.session.query(self.Simulacion).filter_by(id=simulacion_id).first()
            if simulacion is None:
                return (f"Simulacion id {simulacion_id} not found", 404)

            for key, value in data.items():
                setattr(simulacion, key, value)

            self.session.commit()
            return ("Simulacion successfully modified", 200)
        except Exception as error:
            self.session.rollback()
            print(str(error))
            return ("Error while modifying the Simulacion", 500)