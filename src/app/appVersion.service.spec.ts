import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppVersionService } from './appVersion.service';
import { AppVersion } from './model/appVersion';

describe('AppVersionService', () => {
    let service: AppVersionService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });
        service = TestBed.inject(AppVersionService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('requests /server/version and returns the parsed body', async () => {
        const expected: AppVersion = { number: '1.2.3', buildDate: '2026-06-19T00:00:00Z' };

        const result = firstValueFrom(service.load());

        const req = httpMock.expectOne('/server/version');
        expect(req.request.method).toBe('GET');
        req.flush(expected);

        expect(await result).toEqual(expected);
    });

    it('does not retry on a 4xx response and surfaces the error', async () => {
        const result = firstValueFrom(service.load());

        httpMock.expectOne('/server/version').flush('nope', { status: 404, statusText: 'Not Found' });
        // The delay callback re-throws for 4xx, so no second request is issued.
        httpMock.expectNone('/server/version');

        await expect(result).rejects.toMatchObject({ status: 404 });
    });

    it('retries once on a 5xx response and eventually succeeds', async () => {
        vi.useFakeTimers();
        try {
            const expected: AppVersion = { number: '9.9.9', buildDate: '2026-06-19T00:00:00Z' };

            const result = firstValueFrom(service.load());

            httpMock.expectOne('/server/version').flush('boom', { status: 500, statusText: 'Server Error' });
            // First retry is scheduled via timer(retryCount * 500) = 500ms.
            await vi.advanceTimersByTimeAsync(500);
            httpMock.expectOne('/server/version').flush(expected);

            expect(await result).toEqual(expected);
            // No third request once the retry has succeeded.
            httpMock.expectNone('/server/version');
        } finally {
            vi.useRealTimers();
        }
    });

    it('stops after the retry budget (count: 2) is exhausted and rejects', async () => {
        vi.useFakeTimers();
        try {
            const result = firstValueFrom(service.load());
            // Avoid an unhandled-rejection warning while the retries are still in flight.
            const settled = result.then(
                () => 'resolved',
                (err) => err
            );

            const fail = () =>
                httpMock.expectOne('/server/version').flush('boom', { status: 500, statusText: 'Server Error' });

            fail(); // initial attempt
            await vi.advanceTimersByTimeAsync(500); // retry 1 delay = retryCount(1) * 500
            fail();
            await vi.advanceTimersByTimeAsync(1000); // retry 2 delay = retryCount(2) * 500
            fail(); // third (final) attempt — budget exhausted

            // 1 initial + 2 retries = 3 attempts total; no further request is issued.
            httpMock.expectNone('/server/version');
            await expect(Promise.resolve(settled)).resolves.toMatchObject({ status: 500 });
        } finally {
            vi.useRealTimers();
        }
    });
});
