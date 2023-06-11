import 'zone.js/dist/zone';
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  BehaviorSubject,
  map,
  Subject,
  switchMap,
  take,
  takeUntil,
  timer,
} from 'rxjs';

@Injectable()
export class PollingService {
  url$ = new BehaviorSubject<string>('');

  constructor() {
    timer(0, 2000).subscribe(() => {
      this.url$.next('some url');
    });
  }

  startPollingData(url: string) {
    return timer(0, 1000).pipe(map(() => url));
  }
}

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule],
  providers: [PollingService],
  template: `<button (click)="fakeNgOnDestroy()">Destroy</button>`,
})
export class App implements OnInit {
  private polling = inject(PollingService);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.polling.url$
      .pipe(
        // takeUntil(this.destroy$),
        switchMap((url: string) => this.polling.startPollingData(url)),
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe((url) => console.log(url));
  }

  fakeNgOnDestroy() {
    console.log('destroyed?');
    this.destroy$.next();
    this.destroy$.complete();
  }
}

bootstrapApplication(App);
