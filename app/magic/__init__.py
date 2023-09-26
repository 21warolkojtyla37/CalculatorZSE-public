from flask import Blueprint

magic = Blueprint('magic', __name__)

from . import views