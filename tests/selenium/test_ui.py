import pytest
import requests
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from flask import url_for

@pytest.mark.usefixtures("live_server", "test_db")
class TestUI:
    # want to know we got status 200 in the response
    # i.e. are screens TEST1 and TEST2 valid routes?
    def test_status_ok(self):
        url1 = url_for("main.load_screen", screen_id="TEST1", _external=True)
        url2 = url_for("main.load_screen", screen_id="TEST2", _external=True)
        status1 = requests.get(url1).status_code
        status2 = requests.get(url2).status_code
        assert status1 == 200
        assert status2 == 200

    # test1 has no overlays defined¸ so it should have no overlay button
    def test_no_overlay_button(self, browser):
        url = url_for("main.load_screen", screen_id="TEST1", _external=True)
        browser.get(url)
        has_button = self.is_element_present(browser, By.ID, "overlay-select")
        assert has_button is False

    # test2 should however have a visible overlay options button
    def test_overlay_button(self, browser):
        url = url_for("main.load_screen", screen_id="TEST2", _external=True)
        browser.get(url)
        has_button = self.is_element_present(browser, By.ID, "overlay-select")
        assert has_button is True

    # helper method to check if elements are on page
    def is_element_present(self, browser, by, value):
        try:
            browser.find_element(by=by, value=value)
        except NoSuchElementException:
            return False
        return True
