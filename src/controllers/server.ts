import { Response, Request } from 'express';
import Package from '../../package.json';
import { IServerInfo } from '../../src/models';
import { ErrorService } from '../helpers';

/**
 * get server info
 */
type OutputServerInfo = IServerInfo;
export const getServerInfo = ErrorService.catchAsync(async (req: Request, res: Response<OutputServerInfo>) => {
    res.json({
        name: Package.projectName,
        version: Package.version,
        serverTime: new Date(),
    });
});
