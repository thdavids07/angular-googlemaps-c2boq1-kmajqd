import { Component } from '@angular/core';

@Component({
  template: `
  <h1>Map 2</h1>
  <p><a routerLink="../route-1">Go to Map 1</a></p>
  <google-maps-map *googleMaps [center]="center" [zoom]="11" (mapClick)="addMarker($event)">
    <map-marker *ngFor="let markerPosition of markerPositions" [position]="markerPosition" [options]="markerOptions">
    </map-marker>
  </google-maps-map>
  `,
})
export class Route2Component {
  readonly center = { lat: 41.511014, lng: -3.490249 };
  readonly markerOptions = { draggable: false };
  readonly markerPositions = [];

  addMarker(event: any) {
    this.markerPositions.push(event.latLng.toJSON());
  }
}
