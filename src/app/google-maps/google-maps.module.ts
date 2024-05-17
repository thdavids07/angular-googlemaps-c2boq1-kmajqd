import { CommonModule } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import {
  APP_INITIALIZER,
  inject,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { of } from 'rxjs';
import { GeolocationPipe } from './geolocation.pipe';
import { GoogleMapsApiService } from './google-maps-api.service';
import { GoogleMapsMapPoolService } from './google-maps-map-pool.service';
import { GoogleMapsMapComponent } from './google-maps-map.component';
import { GoogleMapsDirective } from './google-maps.directive';
import { GoogleMapsConfig } from './models';
import { GOOGLE_MAPS_CONFIG, GOOGLE_MAPS_PARTIAL_CONFIG } from './tokens';

const COMPONENTS = [GoogleMapsMapComponent];
const DIRECTIVES = [GoogleMapsDirective];
const PIPES = [GeolocationPipe];

const DEFAULT_API_CONFIG: Partial<GoogleMapsConfig> = {
  enabled: true,
  region: 'US',
  load: 'lazy',
  maxMapInstances: 1,
  libraries: [],
};

const eagerApiLoadingFactory = () => {
  const apiService = inject(GoogleMapsApiService);
  const config: GoogleMapsConfig = inject(GOOGLE_MAPS_CONFIG);
  const apiEnabled = config.enabled ?? true;

  return () =>
    apiEnabled && config.load === 'eager' ? apiService.loadApi() : of(true);
};

const combinedConfigFactory = () => {
  let configs: Partial<GoogleMapsConfig | null>[] = inject(
    GOOGLE_MAPS_PARTIAL_CONFIG
  );
  configs = [...configs, DEFAULT_API_CONFIG];

  const config: Partial<GoogleMapsConfig> = configs.reduce<
    Partial<GoogleMapsConfig>
  >(
    (
      combinedConfig: Partial<GoogleMapsConfig>,
      currentConfig: Partial<GoogleMapsConfig | null>
    ) => {
      const newConfig: Partial<GoogleMapsConfig> = { ...combinedConfig };
      newConfig.apiKey ??= currentConfig?.apiKey;
      newConfig.enabled ??= currentConfig?.enabled;
      newConfig.region ??= currentConfig?.region;
      newConfig.load ??= currentConfig?.load;
      newConfig.maxMapInstances ??= currentConfig?.maxMapInstances;
      newConfig.libraries ??= currentConfig?.libraries;
      return newConfig;
    },
    {}
  );
  if (Object.values(config).some((value) => value == null)) {
    throw new Error('Full configuration for Google Maps was not provided.');
  }
  return config;
};

const emptyConfigFactory = () => null;

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    HttpClientJsonpModule,
    GoogleMapsModule,
  ],
  exports: [GoogleMapsModule, ...COMPONENTS, ...DIRECTIVES, ...PIPES],
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
})
export class AppGoogleMapsModule {
  static forRoot(
    config: Partial<GoogleMapsConfig>,
    configFactory?: () => Partial<GoogleMapsConfig>
  ): ModuleWithProviders<AppGoogleMapsModule> {
    return {
      ngModule: AppGoogleMapsModule,
      providers: [
        GoogleMapsApiService,
        GoogleMapsMapPoolService,
        { provide: GOOGLE_MAPS_PARTIAL_CONFIG, useValue: config, multi: true },
        {
          provide: GOOGLE_MAPS_PARTIAL_CONFIG,
          useFactory: configFactory ?? emptyConfigFactory,
          multi: true,
        },
        { provide: GOOGLE_MAPS_CONFIG, useFactory: combinedConfigFactory },
        {
          provide: APP_INITIALIZER,
          useFactory: eagerApiLoadingFactory,
          multi: true,
        },
      ],
    };
  }
}
