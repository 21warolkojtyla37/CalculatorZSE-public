class Config(object):
    """
    Common configurations
    """
    JSON_AS_ASCII = False

class DevelopmentConfig(Config):
    """
    Development configurations
    """

    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    """
    Production configurations
    """

    DEBUG = True

app_config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}