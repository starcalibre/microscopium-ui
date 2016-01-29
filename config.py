"""
Classes for managing app configurations.

See Flask docs: http://flask.pocoo.org/docs/0.10/config/
"""

import os

class Config:
    DEBUG = True

    # If true, minified HTML will be sent to the browser.
    # This should be False during development
    MINIFY_HTML = True

    # the height of the selection box for the genes in the filter menu
    # the number represents the number of items in the menu
    # corresponds to the "size" property in the HTML tag <select>
    UI_GENELIST_HEIGHT = 7

class DevelopmentConfig(Config):
    DEBUG = True

    MINIFY_HTML = False

    # sessions which are used for managing flash messages. a secret
    # key must be declared in order to use sessions.
    SECRET_KEY = "secret string"

    MONGO_DBNAME = "microscopium"

class DemoConfig(Config):
    DEBUG = False

    # sessions which are used for managing flash messages. a secret
    # key must be declared in order to use sessions.
    SECRET_KEY = os.environ.get("MICROSCOPIUM_SECRET_KEY")

    MINIFY_HTML = True

config = {
    "development": DevelopmentConfig,
    "default": DevelopmentConfig,
    "demo": DemoConfig
}
