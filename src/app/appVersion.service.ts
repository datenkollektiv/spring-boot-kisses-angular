import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AppVersion } from './model/appVersion';
import { Observable, retry, throwError, timer } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppVersionService {
    constructor(private http: HttpClient) {
    }

    load(): Observable<AppVersion> {
        return this.http.get<AppVersion>('/server/version').pipe(
            retry({
                count: 2,
                delay: (error, retryCount) => {
                    if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
                        return throwError(() => error);
                    }
                    return timer(retryCount * 500);
                }
            })
        );
    }
}
