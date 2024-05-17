import { InjectionToken } from '@angular/core';
import { GoogleMapsConfig } from '../models';

export const GOOGLE_MAPS_PARTIAL_CONFIG = new InjectionToken<
  Partial<GoogleMapsConfig | null>[]
>('google-maps.partial-config');
