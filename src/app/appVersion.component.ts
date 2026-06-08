import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { AppVersionService } from './appVersion.service';

@Component({
    selector: 'app-version',
    standalone: true,
    template: `
        <div>{{appVersion()}}</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppVersionComponent {
    private readonly appVersionService = inject(AppVersionService);

    readonly appVersion = toSignal(
        this.appVersionService.load().pipe(
            map(res => res.number),
            catchError(err => {
                console.error('Failed to load version:', err);
                return of('Error loading version');
            })
        ),
        { initialValue: 'Loading...' }
    );
}
