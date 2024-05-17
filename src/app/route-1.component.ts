import { Component } from '@angular/core';
import { catchError, filter, map, of, tap, NEVER, delay } from 'rxjs';
import { GeolocationService } from './google-maps/geolocation.service';

@Component({
  template: `
  <h1>Map 1</h1>
  <p><a routerLink="../route-2">Go to Map 2</a></p>
  <google-maps-map *googleMaps [center]="center" [zoom]="11" (mapClick)="addMarker($event)">
    <map-marker *ngFor="let markerPosition of markerPositions" [position]="markerPosition" [options]="markerOptions">
    </map-marker>
    <ng-container *ngIf="position" >
    <map-marker [position]="position | geolocation" [icon]="userPositionMarkerIcon"></map-marker>
    <map-circle [center]="position | geolocation" [radius]="position.coords.accuracy" [options]="blueCircleOptions"></map-circle>
    </ng-container>
  </google-maps-map>
  `,
  providers: [GeolocationService],
})
export class Route1Component {
  readonly center = { lat: 40.511014, lng: -3.490249 };
  readonly markerOptions = { draggable: false };
  readonly markerPositions = [];

  userPositionMarkerIcon = {};

  readonly blueCircleOptions = {
    fillOpacity: 0.4,
    strokeWeight: 1,
    fillColor: '#5384ED',
    strokeColor: '#5384ED',
  };

  position: GeolocationPosition | null = null;

  readonly position$ = this.geolocation
    .position()
    .pipe(
      catchError(() => NEVER),
      delay(500),
      tap((position) => {
        this.position = position;
        this.userPositionMarkerIcon = {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillOpacity: 1,
          strokeWeight: 2,
          fillColor: '#5384ED',
          strokeColor: '#ffffff',
        };
      })
    )
    .subscribe();

  constructor(private readonly geolocation: GeolocationService) {}

  addMarker(event: any) {
    this.markerPositions.push(event.latLng.toJSON());
  }
}
