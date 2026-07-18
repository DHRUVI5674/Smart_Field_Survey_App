import * as Location from 'expo-location';

export async function reverseGeocode(lat, lng) {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (address) {
      const { name, street, city, region, postalCode, country } = address;
      return `${name ? name + ', ' : ''}${street ? street + ', ' : ''}${city}, ${region} ${postalCode}, ${country}`;
    }
    return '';
  } catch (e) {
    console.warn('Reverse geocode failed', e);
    return '';
  }
}
