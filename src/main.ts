import { provideHttpClient } from '@angular/common/http';
import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from './environments/environment';
import { AppVersionComponent } from './app/appVersion.component';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppVersionComponent, {
    providers: [
        provideHttpClient(),
        provideZonelessChangeDetection()
    ]
}).catch(err => console.error(err));
