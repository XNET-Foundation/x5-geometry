import { haversine, travel, gpsDiff, sigmaTest, encodeGPS, decodeGPS } from '../geom';
import { LatLon } from '../types';

describe('Geometry Utilities', () => {
  describe('haversine', () => {
    it('should calculate distance between two points', () => {
      // Test with known coordinates (San Francisco to Los Angeles)
      const distance = haversine(37.7749, -122.4194, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(500000); // Should be roughly 550km
      expect(distance).toBeLessThan(600000);
    });

    it('should handle same point', () => {
      const distance = haversine(0, 0, 0, 0);
      expect(distance).toBe(0);
    });
  });

  describe('travel', () => {
    it('should calculate new position after travel', () => {
      const start: LatLon = [0, 0];
      const result = travel(start[0], start[1], 1000, 1000);
      expect(result[0]).toBeGreaterThan(0);
      expect(result[1]).toBeGreaterThan(0);
    });

    it('should travel short distances accurately', () => {
      // San Francisco coordinates
      const sf: LatLon = [37.7749, -122.4194];
      // Berkeley coordinates (about 25km away)
      const berkeley: LatLon = [37.8715, -122.2730];
      
      // Calculate the distance between SF and Berkeley
      const distance = haversine(sf[0], sf[1], berkeley[0], berkeley[1]);
      
      // Calculate the bearing angle (in radians)
      const y = Math.sin((berkeley[1] - sf[1]) * Math.PI / 180) * Math.cos(berkeley[0] * Math.PI / 180);
      const x = Math.cos(sf[0] * Math.PI / 180) * Math.sin(berkeley[0] * Math.PI / 180) -
                Math.sin(sf[0] * Math.PI / 180) * Math.cos(berkeley[0] * Math.PI / 180) * Math.cos((berkeley[1] - sf[1]) * Math.PI / 180);
      const bearing = Math.atan2(y, x);
      
      // Calculate the x and y components of the travel vector
      const Δx = distance * Math.sin(bearing);
      const Δy = distance * Math.cos(bearing);
      
      // Travel from SF to Berkeley
      const result = travel(sf[0], sf[1], Δx, Δy);
      
      // The result should be close to Berkeley coordinates
      expect(Math.abs(result[0] - berkeley[0])).toBeLessThan(0.01); // Within 0.01 degrees latitude
      expect(Math.abs(result[1] - berkeley[1])).toBeLessThan(0.01); // Within 0.01 degrees longitude
    });
  });

  describe('GPS Functions', () => {
    it('should encode and decode GPS coordinates', () => {
      const original: LatLon = [37.7749, -122.4194]; // San Francisco
      const encoded = encodeGPS(original[0], original[1]);
      const decoded = decodeGPS(encoded);
      
      // Allow for small floating point differences due to grid quantization
      expect(Math.abs(decoded[0] - original[0])).toBeLessThan(0.1);
      expect(Math.abs(decoded[1] - original[1])).toBeLessThan(0.1);
    });

    it('should handle coordinates within valid range', () => {
      const testCases: LatLon[] = [
        [0, 0],                    // Origin
        [37.7749, -122.4194],      // San Francisco
        [34.0522, -118.2437],      // Los Angeles
        [40.7128, -74.0060],       // New York
        [51.5074, -0.1278],        // London
        [35.6762, 139.6503],       // Tokyo
      ];

      for (const [lat, lon] of testCases) {
        const encoded = encodeGPS(lat, lon);
        const decoded = decodeGPS(encoded);
        
        // Allow for grid quantization effects
        expect(Math.abs(decoded[0] - lat)).toBeLessThan(0.1);
        expect(Math.abs(decoded[1] - lon)).toBeLessThan(0.1);
      }
    });

    it('should reject coordinates outside valid range', () => {
      const invalidCases: LatLon[] = [
        [71, 0],    // Latitude too high
        [-71, 0],   // Latitude too low
        [0, 181],   // Longitude too high
        [0, -181],  // Longitude too low
      ];

      for (const [lat, lon] of invalidCases) {
        expect(() => encodeGPS(lat, lon)).toThrow();
      }
    });

    it('should calculate GPS difference', () => {
      const sf = encodeGPS(37.7749, -122.4194); // San Francisco
      const la = encodeGPS(34.0522, -118.2437); // Los Angeles
      const diff = gpsDiff(sf, la);
      expect(diff).toBeGreaterThan(500000); // Should be roughly 550km
      expect(diff).toBeLessThan(600000);
    });

    it('should perform sigma test', () => {
      const sf = encodeGPS(37.7749, -122.4194); // San Francisco
      const sf2 = encodeGPS(37.7749, -122.4194); // Same coordinates
      const result = sigmaTest(sf, sf2);
      expect(result).toBe(true);
    });

    it('should handle coordinate wrapping', () => {
      // Test longitude wrapping
      const p1 = encodeGPS(0, 179);
      const p2 = encodeGPS(0, -179);
      const diff = gpsDiff(p1, p2);
      expect(diff).toBeLessThan(300000); // Should be roughly 222km at equator
      
      // Test latitude wrapping at maxLat
      const p3 = encodeGPS(69, 0);
      const p4 = encodeGPS(70, 0);
      const latDiff = gpsDiff(p3, p4);
      expect(latDiff).toBeLessThan(200000); // Should be roughly 111km
    });
  });
}); 