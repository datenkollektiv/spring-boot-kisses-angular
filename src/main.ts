import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppVersionComponent } from './app/appVersion.component';

bootstrapApplication(AppVersionComponent, {
    providers: [
        provideHttpClient(),
        provideZonelessChangeDetection()
    ]
}).catch(err => console.error(err));
