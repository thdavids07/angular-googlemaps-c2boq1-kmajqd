import { GoogleMapsLibrary } from './google-maps-libraries';

export interface GoogleMapsConfig {
  apiKey: string;

  /**
   * If eager it will be loaded on app init, if lazy first time it is used. Default: lazy
   */
  load: 'eager' | 'lazy';

  /**
   * Disable completely Google Maps, won't event load the API. Default: enabled
   */
  enabled: boolean;

  /**
   * Additional libraries to be loaded. Default: any
   * https://developers.google.com/maps/documentation/javascript/libraries
   */
  libraries: readonly GoogleMapsLibrary[];

  /**
   * Map instances are reused to avoid multiple instantiations, and higher cost. Default: 1
   */
  maxMapInstances: number;

  /**
   * Region of the map that bias the application. Default: US
   * https://developers.google.com/maps/documentation/javascript/localization#Region
   * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Current_codes
   * https://developers.google.com/maps/coverage
   */
  region: string;
}
