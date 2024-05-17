import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppGoogleMapsModule } from './google-maps';
import { Route1Component } from './route-1.component';
import { Route2Component } from './route-2.component';

@NgModule({
  imports: [
    BrowserModule,
    AppGoogleMapsModule.forRoot({
      apiKey: 'AIzaSyDn4DYMQQDikiLOMgP1DJegHIFxUcUwAIY',
    }),
    RouterModule.forRoot([
      { path: 'route-1', component: Route1Component },
      { path: 'route-2', component: Route2Component },
      { path: '', pathMatch: 'full', redirectTo: 'route-1' },
      { path: '**', redirectTo: 'route-1' },
    ]),
  ],
  declarations: [AppComponent, Route1Component, Route2Component],
  bootstrap: [AppComponent],
})
export class AppModule {}
