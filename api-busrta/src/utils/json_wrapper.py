from functools import wraps
from flask import jsonify, request

def format_json(func):
    @wraps(func)
    def wrapper_json(*args, **kwargs):
        result = func(*args, **kwargs)
        status_code = 200
        if isinstance(result, tuple):
            result, status_code = result
            
        json_response = {
            "request": request.url,
            "client": request.remote_addr,
            "status_code": status_code,
            "result": result
        }
        
        response = jsonify(json_response)
        response.status_code = status_code
        response.headers['Content-Type'] = 'application/json'
        
        return response
    return wrapper_json