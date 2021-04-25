import { Response, Request } from 'express';
import Package from '../../package.json';
import { Controller } from '.';
import { IServerInfo } from '../models';

/**
 * get server info
 */
type OutputServerInfo = IServerInfo;
export const getServerInfo = new Controller<any, OutputServerInfo>(async (req, res) => {
    res.json({
        name: Package.projectName,
        version: Package.version,
        serverTime: new Date(),
    });
}).func;
