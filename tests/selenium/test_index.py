import pytest
from flask import url_for
import json

# create fixture for MongoDB test database
@pytest.fixture(scope="module")
def test_db(request):
    from pymongo import MongoClient
    client = MongoClient('localhost', 27017)
    test_db = client["microscopium-test"]

    with open("tests/selenium/data/test_screens.json") as json_file:
        test_data = json.load(json_file)
        test_db.screens.insert(test_data)

    def teardown():
        client.drop_database("microscopium-test")
        client.close()
    request.addfinalizer(teardown)
    return test_db


@pytest.mark.usefixtures("live_server", "browser", "test_db")
class TestIndex:
    # test that "Microscopium" in the header, i.e. the base template
    # loaded OK
    def test_title(self, browser):
        browser.get(url_for('main.index', _external=True))
        assert "Microscopium" in browser.title

    # test that we have three rows in the screen select table;
    # the header, and the two choices of screens
    def test_screen_select_rows(self, browser):
        browser.get(url_for('main.index', _external=True))
        screens = browser.find_elements_by_xpath("//table//tr")
        assert len(screens) == 3
