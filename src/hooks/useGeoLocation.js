import { useState, useEffect } from 'react';

/**
 * Hook to detect user's country via geo-IP
 * @returns {Object} { countryCode: string, isLoading: boolean, error: string | null }
 */
const useGeoLocation = () => {
  const [countryCode, setCountryCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, try to get IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        // Then get geo location data
        const geoResponse = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
        
        if (!geoResponse.ok) {
          throw new Error('Failed to fetch geo location');
        }

        const geoData = await geoResponse.json();
        const country = geoData.country_code?.toUpperCase() || null;
        
        setCountryCode(country);
      } catch (err) {
        console.error('Error detecting country:', err);
        setError(err.message);
        // Default to null if detection fails
        setCountryCode(null);
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
  }, []);

  return { countryCode, isLoading, error };
};

export default useGeoLocation;

