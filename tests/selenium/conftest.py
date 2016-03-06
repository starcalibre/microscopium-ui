import pytest
from selenium import webdriver
from app import create_app
import json

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


# create fixture for MongoDB test database
@pytest.fixture(scope="session", autouse=True)
def test_db(request):
    from pymongo import MongoClient
    client = MongoClient('localhost', 27017)
    db = client["microscopium-test"]

    with open("tests/selenium/data/test_screens.json") as json_file:
        test_data = json.load(json_file)
        db.screens.insert(test_data)

    with open("tests/selenium/data/test_samples.json") as json_file:
        test_data = json.load(json_file)
        db.samples.insert(test_data)

    with open("tests/selenium/data/test_features.json") as json_file:
        test_data = json.load(json_file)
        db.features.insert(test_data)

    def teardown():
        client.drop_database("microscopium-test")
        client.close()
    request.addfinalizer(teardown)
    return db
