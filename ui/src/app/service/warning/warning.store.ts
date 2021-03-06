import {Injectable} from '@angular/core';
import {Warning} from 'app/model/warning.model';
import * as immutable from 'immutable';
import {BehaviorSubject, Observable} from 'rxjs';
import {WarningService} from './warning.service';

/**
 * Service to get warnings
 */
@Injectable()
export class WarningStore {

    // List of all warnings.
    private _projectWarning: BehaviorSubject<immutable.Map<string, immutable.Map<string, Warning>>> =
        new BehaviorSubject(immutable.Map<string, immutable.Map<string, Warning>>());

    constructor(private _warningService: WarningService) {
    }

    getProjectWarnings(key: string) {
        if (this._projectWarning.getValue().size === 0) {
            this._warningService.getProjectWarnings(key).subscribe(ws => {
                this.pushWarnings(key, ws);
            });
        }
        return new Observable<immutable.Map<string, immutable.Map<string, Warning>>>(fn => this._projectWarning.subscribe(fn));
    }

    pushWarnings(key: string, ws: Array<Warning>): void {
        let projWarnings = immutable.Map<string, Warning>();
        if (ws) {
            ws.forEach(w => {
                if (w.key) {
                    projWarnings = projWarnings.set(w.type + '-' + w.element, w)
                }
            });
            this._projectWarning.next(this._projectWarning.getValue().set(key, projWarnings));
        }
    }

    updateWarning(key: string, w: Warning): Observable<Warning> {
        return this._warningService.update(key, w).map(warn => {
            let m = this._projectWarning.getValue();
            let mw = m.get(key);
            mw = mw.set(warn.type + '-' + warn.element, warn);
            m = m.set(key, mw);
            this._projectWarning.next(m);
            return warn;
        });
    }
}
