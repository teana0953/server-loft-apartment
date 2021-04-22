import { interval, Subject } from 'rxjs';
import { buffer, bufferCount, concatMap, merge } from 'rxjs/operators';
import { EmailService } from '../helpers';

/**
 * Email Action
 */
class Action {
    /**
     *
     */
    private _action$: Subject<Action.IAction> = new Subject();
    public get action$(): Subject<Action.IAction> {
        return this._action$;
    }

    constructor() {
        this.initiation();
    }

    private initiation() {
        let buffer$ = this._action$.pipe(bufferCount(10));

        this._action$
            .pipe(
                buffer(this._action$.pipe(merge(buffer$, interval(1000)))),
                concatMap(async (actions) => {
                    try {
                        await Promise.all(
                            actions.map(async (action) => {
                                await EmailService.sendEmail({
                                    from: 'loft-apartment',
                                    to: action.to,
                                    subject: action.subject,
                                    html: action.html,
                                });
                            }),
                        );
                    } catch (error) {
                        console.log('email action error', error);
                    }
                }),
            )
            .subscribe();
    }
}

namespace Action {
    /**
     *
     */
    export interface IAction {
        to: string[];
        subject: string;
        html: string;
    }
}

export default new Action();
