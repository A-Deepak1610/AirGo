import os
import unittest
import pandas as pd
from scripts.generate_dgca_route_basket import process_dgca_dataset

class TestDGCABasket(unittest.TestCase):
    def test_basket_generation(self):
        csv_file = "test_dgca_basket_output.csv"
        basket = process_dgca_dataset(output_csv=csv_file, top_n=100)
        
        # 1. Total rows
        self.assertEqual(len(basket), 100)
        
        # 2. Sum of within basket weights == 1.0
        self.assertAlmostEqual(basket['weight_traffic_within_basket'].sum(), 1.0, places=4)
        
        # 3. No duplicate routes
        self.assertEqual(basket['route'].nunique(), 100)
        
        # 4. Correct 3-letter IATA format
        for r in basket['route']:
            parts = r.split('-')
            self.assertEqual(len(parts), 2)
            self.assertEqual(len(parts[0]), 3)
            self.assertEqual(len(parts[1]), 3)
            
        # 5. Check Tier counts
        self.assertEqual(len(basket[basket['tier'] == 'Tier 1']), 15)
        self.assertEqual(len(basket[basket['tier'] == 'Tier 2']), 15)
        self.assertEqual(len(basket[basket['tier'] == 'Tier 3']), 70)
        
        # 6. National traffic coverage > 70%
        coverage = basket['total_pax'].sum() / 165541692
        self.assertGreater(coverage, 0.70)
        
        if os.path.exists(csv_file):
            os.remove(csv_file)

if __name__ == "__main__":
    unittest.main()
