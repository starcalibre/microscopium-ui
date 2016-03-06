import pytest
from flask import url_for

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
