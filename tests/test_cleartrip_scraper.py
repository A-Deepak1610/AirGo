import os
import sys
import unittest

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from scrape_cleartrip import parse_cleartrip_flight_card


class TestCleartripScraper(unittest.TestCase):

    def test_parse_cleartrip_flight_card_indigo(self):
        sample_text = """
        IndiGo
        6E-5014
        18:30
        3h 55m
        Non-stop
        22:25
        ₹6,179
        ₹768 off with SBIDC
        Book
        """
        parsed = parse_cleartrip_flight_card(sample_text)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed["carrier"], "IndiGo")
        self.assertEqual(parsed["carrier_code"], "6E")
        self.assertEqual(parsed["flight_number"], "6E-5014")
        self.assertEqual(parsed["departure_time"], "18:30")
        self.assertEqual(parsed["arrival_time"], "22:25")
        self.assertEqual(parsed["stops"], 0)
        self.assertEqual(parsed["total_fare"], 6179.0)
        self.assertGreater(parsed["base_fare"], 0)
        self.assertGreater(parsed["taxes_and_fees"], 0)

    def test_parse_cleartrip_flight_card_spicejet(self):
        sample_text = """
        SpiceJet
        SG-802
        22:30
        2h 20m
        Non-stop
        00:50
        ₹6,408
        Book
        """
        parsed = parse_cleartrip_flight_card(sample_text)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed["carrier"], "SpiceJet")
        self.assertEqual(parsed["carrier_code"], "SG")
        self.assertEqual(parsed["flight_number"], "SG-802")
        self.assertEqual(parsed["departure_time"], "22:30")
        self.assertEqual(parsed["arrival_time"], "00:50")
        self.assertEqual(parsed["total_fare"], 6408.0)

    def test_parse_cleartrip_flight_card_invalid(self):
        invalid_text = "No flight available for this route"
        parsed = parse_cleartrip_flight_card(invalid_text)
        self.assertIsNone(parsed)


if __name__ == "__main__":
    unittest.main()
