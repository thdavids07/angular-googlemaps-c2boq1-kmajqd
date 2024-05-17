import {
  ChangeDetectorRef,
  Inject,
  Injectable,
  InjectionToken,
  OnDestroy,
} from '@angular/core';
import { defer, EMPTY, Observable, Subject, throwError } from 'rxjs';
import { finalize, shareReplay, takeUntil, tap } from 'rxjs/operators';

export const GEOLOCATION_OPTIONS = new InjectionToken<PositionOptions>(
  'position-options',
  {
    providedIn: 'root',
    factory: () => ({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0,
    }),
  }
);

@Injectable()
export class GeolocationService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(GEOLOCATION_OPTIONS)
    private readonly geolocationOptions: PositionOptions,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  private readonly position$ = defer(() => {
    if (!this.isSupported()) {
      return throwError(() => new Error('Geolocation not supported'));
    }

    let watchPositionId = 0;

    const position$ = new Observable<GeolocationPosition>((subscriber) => {
      watchPositionId = navigator.geolocation.watchPosition(
        (position) => {
          subscriber.next(position);
          this.cdr.markForCheck();
        },
        (positionError) => {
          subscriber.error(positionError);
          this.cdr.markForCheck();
        },
        this.geolocationOptions
      );
      return () => navigator.geolocation.clearWatch(watchPositionId);
    });

    return position$.pipe(
      takeUntil(this.destroy$),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  });

  position(): Observable<GeolocationPosition> {
    return this.position$;
  }
}
