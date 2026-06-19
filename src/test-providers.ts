import { provideZonelessChangeDetection } from '@angular/core';

// The application bootstraps zoneless (no Zone.js), so the TestBed must too.
// `@angular/build:unit-test` applies this default export to the test environment.
export default [provideZonelessChangeDetection()];
