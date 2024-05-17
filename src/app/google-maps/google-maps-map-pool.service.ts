import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { BehaviorSubject, defer, Observable, of, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { GoogleMapsConfig, GoogleMapsMapPoolItem } from './models';
import { GOOGLE_MAPS_CONFIG } from './tokens';

@Injectable()
export class GoogleMapsMapPoolService {
  private readonly mapPool = new Set<GoogleMapsMapPoolItem>();
  private createdMaps = 0;

  constructor(
    private readonly ngZone: NgZone,
    @Inject(GOOGLE_MAPS_CONFIG) private readonly config: GoogleMapsConfig
  ) {}

  renderMap(
    hostElement: HTMLElement,
    options?: any
  ): Observable<GoogleMapsMapPoolItem> {
    return defer(() => {
      let googleMap: GoogleMapsMapPoolItem;
      this.ngZone.runOutsideAngular(() => {
        googleMap = this.createMap(hostElement, options);
      });

      const googleMapsSubject = new BehaviorSubject<GoogleMapsMapPoolItem>(
        googleMap
      );

      return googleMapsSubject.pipe(
        finalize(() => {
          this.ngZone.runOutsideAngular(() => {
            this.disposeMap(googleMap);
          });
        })
      );
    });
  }

  private createMap(
    hostElement: HTMLElement,
    options?: any
  ): GoogleMapsMapPoolItem {
    if (this.mapPool.size > 0) {
      console.log('map reused');
      const [googleMap] = this.mapPool;
      this.mapPool.delete(googleMap);
      hostElement.appendChild(googleMap.mapElement);
      googleMap.map.setOptions(options);
      return googleMap;
    }

    if (this.createdMaps >= this.config.maxMapInstances) {
      throw new Error(
        `App is configured to only support ${this.config.maxMapInstances} map(s) at a time, but an additional one is needed. If it is expected, increase the max supported instances in the module configuration when importing AppGoogleMapsModule.forRoot().`
      );
    }

    const mapElement = document.createElement('div');
    hostElement.appendChild(mapElement);
    console.log('map created');
    const map = new (window as any).google.maps.Map(mapElement, {
      ...options,
    });
    this.createdMaps++;

    return { mapElement, map };
  }

  private disposeMap(googleMap?: GoogleMapsMapPoolItem) {
    console.log('map disponsed');
    if (googleMap == null) {
      return;
    }

    this.mapPool.add(googleMap);
    googleMap.mapElement.remove();
    (window as any).google.maps.event.clearInstanceListeners(googleMap.map);
  }
}
