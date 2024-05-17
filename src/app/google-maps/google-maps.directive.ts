import {
  Directive,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { GoogleMapsApiService } from './google-maps-api.service';

@Directive({ selector: 'ng-template[googleMaps]' })
export class GoogleMapsDirective implements OnInit, OnDestroy {
  @Output() apiLoaded = new EventEmitter<boolean>();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    public readonly apiService: GoogleMapsApiService
  ) {}

  ngOnInit() {
    this.apiService
      .loadApi()
      .pipe(
        takeUntil(this.destroy$),
        tap((loaded) => this.apiLoaded.emit(loaded)),
        filter(Boolean)
      )
      .subscribe(() => {
        this.viewContainer.createEmbeddedView(this.templateRef);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
