import {
  Component,
  ElementRef,
  forwardRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Subject, takeUntil, tap } from 'rxjs';
import { GoogleMapsApiService } from './google-maps-api.service';
import { GoogleMapsMapPoolService } from './google-maps-map-pool.service';

@Component({
  selector: 'google-maps-map',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: GoogleMap,
      useExisting: forwardRef(() => GoogleMapsMapComponent),
    },
  ],
})
export class GoogleMapsMapComponent
  extends GoogleMap
  implements OnInit, OnDestroy
{
  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly apiService: GoogleMapsApiService,
    private readonly elementRef: ElementRef,
    _ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly mapsPool: GoogleMapsMapPoolService
  ) {
    super(elementRef, _ngZone, platformId);

    const mapComponent: any = this; // Hack to access private properties, this should be protected with an e2e test

    this.mapsPool
      .renderMap(this.elementRef.nativeElement, mapComponent._combineOptions())
      .pipe(
        takeUntil(this.destroy$),
        tap(({ map, mapElement }) => {
          mapComponent._mapEl = mapElement;
          this.googleMap = map;
        })
      )
      .subscribe();
  }

  override ngOnInit() {
    const mapComponent: any = this; // Hack to access private properties, this should be protected with an e2e test
    this.googleMap!.setOptions(mapComponent._combineOptions());
    mapComponent._setSize();
    mapComponent._eventManager.setTarget(this.googleMap!);
    this.mapInitialized.emit(this.googleMap!);
  }

  override ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy();
  }
}
