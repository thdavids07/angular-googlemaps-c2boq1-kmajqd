import { InjectionToken } from '@angular/core';
import { GoogleMapsConfig } from '../models';

export const GOOGLE_MAPS_CONFIG = new InjectionToken<GoogleMapsConfig>(
  'google-maps.config'
);
