import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import {AppVersionComponent} from './appVersion.component';

@NgModule({ declarations: [AppVersionComponent],
    bootstrap: [AppVersionComponent], imports: [BrowserModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class HomepageModule {
}
