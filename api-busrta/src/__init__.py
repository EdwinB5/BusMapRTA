from flask import Flask, Blueprint
from flask_restful import Api
from flask_cors import CORS

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from geoalchemy2 import Geometry

import os

app = Flask(__name__)
#Configuración de CORS
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SECRET_KEY'] = 'busmap2023'

# Db Credentials
USER = os.environ.get('BM_USER')
PASSWORD = os.environ.get('BM_PASSWORD')
HOST = os.environ.get('BM_HOST')
PORT = os.environ.get('BM_PORT')
DB = os.environ.get('BM_DB')

engine = create_engine(f'postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB}')

Base = automap_base()
Base.prepare(engine, reflect=True)

api_route = Blueprint('api', __name__, url_prefix='/api')

api = Api(api_route)
session = Session(engine)

# import recursos y rutas
from src.resources.buses import Buses
from src.resources.simulacion import Simulacion
from src.resources.cundinamarca import Cundinamarca
from src.resources.municipios import Municipios, MunicipioUpdate

api.add_resource(Municipios, '/municipios')
api.add_resource(MunicipioUpdate, '/municipios/modificar')
api.add_resource(Cundinamarca, '/cundinamarca')
api.add_resource(Simulacion, '/simulacion')
api.add_resource(Buses, '/buses')

# Ruta de inicio


@api_route.route('/')
def default_route():
    return '¡Bienvenido a la API Bus Map!'


# Registrar el Blueprint después de configurar todas las rutas y recursos
app.register_blueprint(api_route)

if __name__ == '__main__':
    app.run(debug=True)
