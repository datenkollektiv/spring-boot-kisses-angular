import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppVersionComponent } from './appVersion.component';

describe('AppVersionComponent', () => {
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppVersionComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('shows the loading placeholder before the response arrives', () => {
        const fixture = TestBed.createComponent(AppVersionComponent);
        fixture.detectChanges();

        httpMock.expectOne('/server/version'); // pending, not yet flushed
        expect(fixture.nativeElement.textContent).toContain('Loading...');
    });

    it('renders the version number once the request resolves', async () => {
        const fixture = TestBed.createComponent(AppVersionComponent);
        fixture.detectChanges();

        httpMock.expectOne('/server/version').flush({ number: '4.2.0', buildDate: '2026-06-19T00:00:00Z' });
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('4.2.0');
    });

    it('falls back to an error message when the request fails', async () => {
        // Silence the component's diagnostic console.error so the test output stays clean.
        // We assert on the user-visible state, not the (incidental) logging call.
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        try {
            const fixture = TestBed.createComponent(AppVersionComponent);
            fixture.detectChanges();

            httpMock.expectOne('/server/version').flush('boom', { status: 404, statusText: 'Not Found' });
            await fixture.whenStable();
            fixture.detectChanges();

            const text = fixture.nativeElement.textContent;
            expect(text).toContain('Error loading version');
            expect(text).not.toContain('Loading...');
        } finally {
            consoleError.mockRestore();
        }
    });
});
