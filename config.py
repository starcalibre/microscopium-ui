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

    # sessions which are used for managing flash messages. a secret
    # key must be declared in order to use sessions.
    SECRET_KEY = os.environ.get("MICROSCOPIUM_SECRET_KEY") or "secret string"


class DevelopmentConfig(Config):
    MINIFY_HTML = False
    MONGO_DBNAME = "microscopium"


class TestConfig(Config):
    MONGO_DBNAME = "microscopium-test"

config = {
    "development": DevelopmentConfig,
    "default": DevelopmentConfig,
    "test": TestConfig
}
