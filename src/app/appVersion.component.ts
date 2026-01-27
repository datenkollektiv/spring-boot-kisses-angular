import {Component, OnInit} from '@angular/core';

import {AppVersionService} from './appVersion.service';

@Component({
    selector: 'app-version',
    standalone: true,
    template: `
        <div>{{appVersion}}</div>
    `,
    providers: [AppVersionService]
})
export class AppVersionComponent implements OnInit {
    appVersion = 'Loading...';

    constructor(private appVersionService: AppVersionService) {}

    ngOnInit(): void {
        this.appVersionService.load().subscribe({
            next: (res) => this.appVersion = res.number,
            error: (err) => {
                console.error('Failed to load version:', err);
                this.appVersion = 'Error loading version';
            }
        });
    }
}
