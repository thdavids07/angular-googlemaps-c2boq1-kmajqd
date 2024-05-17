import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID, PLATFORM_ID } from '@angular/core';
import { catchError, defer, map, Observable, of, Subject } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { GoogleMapsConfig } from './models';
import { GOOGLE_MAPS_CONFIG } from './tokens';

// quarterly is the most predictable, and the one that causes a version increase
// https://developers.google.com/maps/documentation/javascript/versions#release-channels-and-version-numbers
const API_VERSION = 'quarterly';

// Only those that have main language and coutry code
const SPECIFIC_SUPPORTED_LOCALES = [
  'zh-CN',
  'zh-HK',
  'zh-TW',
  'en-AU',
  'en-GB',
  'fr-CA',
  'pt-BR',
  'es-419',
].map((locale) => locale.toLowerCase());

@Injectable()
export class GoogleMapsApiService {
  private readonly lazyLoadApi$ = this.httpClient
    .jsonp(this.apiUrl, 'callback')
    .pipe(
      map(() => true),
      catchError(() => of(false)),
      shareReplay({ bufferSize: 1, refCount: false })
    );

  private readonly loadApi$: Observable<boolean> = defer(() => {
    if (this.config.enabled === false) {
      return of(false);
    }

    // If not running in the browser or it was already loaded
    if (isPlatformBrowser(this.platformId) && (window as any).google != null) {
      return of(true);
    }

    return this.lazyLoadApi$.pipe(take(1));
  });

  constructor(
    private readonly httpClient: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Inject(GOOGLE_MAPS_CONFIG) private readonly config: GoogleMapsConfig,
    @Inject(LOCALE_ID) private readonly localeId: string
  ) {}

  loadApi(): Observable<boolean> {
    return this.loadApi$;
  }

  private get apiUrl(): string {
    //https://github.com/angular/components/tree/master/src/google-maps#lazy-loading-the-api
    const queryParams: {
      [key: string]: string | string[] | null;
    } = {
      v: API_VERSION,
      key: this.config.apiKey,
      libraries: this.config.libraries as string[],
      region: this.config.region,
      language: this.localeId !== 'en-US' ? this.getLocaleId() : null,
    };

    const params = Object.keys(queryParams)
      .filter((k: string) => !!queryParams[k]) // Remove nulls and empty arrays
      .reduce((params, key) => {
        const value = queryParams[key] as string | string[];
        params.append(key, Array.isArray(value) ? value.join(',') : value);
        return params;
      }, new URLSearchParams());

    return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
  }

  // https://developers.google.com/maps/faq#languagesupport
  private getLocaleId(): string {
    const localeId = this.localeId;
    if (SPECIFIC_SUPPORTED_LOCALES.indexOf(localeId.toLowerCase()) !== -1) {
      return this.localeId;
    }

    return this.localeId.substring(2);
  }
}
