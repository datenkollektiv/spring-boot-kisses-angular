import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from './environments/environment';
import { AppVersionComponent } from './app/appVersion.component';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppVersionComponent, {
    providers: [
        provideHttpClient()
    ]
});
