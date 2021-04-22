import { Request, Response } from 'express';
import { ErrorService } from '../helpers';

type TControllerCallback<Input, Output> = (req: Request<Input>, res: Response<Output>) => Promise<any>;

export class Controller<Input, Output> {
    private _callback: TControllerCallback<Input, Output> = undefined;

    constructor(callback: TControllerCallback<Input, Output>) {
        this._callback = callback;
    }

    /**
     * exec
     * @description real controller
     */
    public get exec() {
        return ErrorService.catchAsync(this._callback);
    }
}
