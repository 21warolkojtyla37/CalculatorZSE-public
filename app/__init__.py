from flask import Flask
from flask_bootstrap import Bootstrap
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
login_manager = LoginManager()

def create_app(config_name = 'development'):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_pyfile('C:/Projekty/CalculatorZSE/instance/config.py')

    Bootstrap(app)
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_message = "Musisz być zalogowanym żeby wejść na tą stronę."
    login_manager.login_view = "auth.login"
    migrate = Migrate(app, db)

    from . import models

    from .admin import admin as admin_blueprint
    app.register_blueprint(admin_blueprint, url_prefix='/admin/')

    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/auth/')

    from .api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api/')

    from .home import home as home_blueprint
    app.register_blueprint(home_blueprint, url_prefix='/')
    
    from .magic import magic as magic_blueprint
    app.register_blueprint(magic_blueprint, url_prefix='/calculations/')

    from .v2 import v2 as v2_blueprint
    app.register_blueprint(v2_blueprint, url_prefix='/v2/')

    return app