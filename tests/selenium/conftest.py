import pytest
from selenium import webdriver
from app import create_app

# specify webdrivers here for testing
# currently only using Firefox as other browsers
# need an external webdriver to be configured
BROWSERS = {
    "firefox": webdriver.Firefox
}


# generator for browser webdrivers
@pytest.yield_fixture(params=BROWSERS.keys())
def browser(request):
    driver = BROWSERS[request.param]()
    yield driver
    driver.quit()


# create fixture for flask app instance
@pytest.fixture
def app():
    return create_app("test")
