import {Component} from '@angular/core';

import {AppVersionService} from './appVersion.service';

@Component({
    selector: 'app-version',
    template: `
        <div>{{appVersion}}</div>
    `,
    providers: [AppVersionService]
})

export class AppVersionComponent {
    appVersion = 'Loading...';

    constructor(private appVersionService: AppVersionService) {
        this.appVersionService.load().subscribe(res => this.appVersion = res.number);
    }
}
