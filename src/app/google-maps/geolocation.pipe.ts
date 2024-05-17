import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'geolocation' })
export class GeolocationPipe implements PipeTransform {
  transform(geolocation: GeolocationPosition | null | undefined) {
    if (geolocation == null) {
      return null;
    }

    return {
      lat: geolocation.coords.latitude,
      lng: geolocation.coords.longitude,
    };
  }
}
