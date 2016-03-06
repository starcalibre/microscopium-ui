import pytest
from flask import url_for

# create fixture for MongoDB test database
@pytest.fixture(scope="module")
def test_db(request):
    from pymongo import MongoClient
    client = MongoClient('localhost', 27017)
    test_db = client["microscopium-test"]

    test_db.screens.insert({
        "_id": "TEST_SCREEN_1",
        "available_overlays": [],
        "screen_features": ["feature1", "feature2", "feature3"],
        "number_samples": 12,
        "screen_desc": "Mock Screen data for testing screen with "
                       "no overlay."
    })

    test_db.screens.insert({
        "_id": "TEST_SCREEN_2",
        "available_overlays": ["overlay_score"],
        "screen_features": ["feature1", "feature2", "feature3"],
        "number_samples": 12,
        "screen_desc": "Mock Screen data for testing screen with "
                       "overlay."
    })

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
