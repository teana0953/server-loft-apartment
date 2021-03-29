import { query, Request, Response } from 'express';
import { ErrorService, QueryHelper } from '../helpers';
import { IDB, IResponse, IResponseBase } from '../models';

export const createDemo = ErrorService.catchAsync(async (req: Request, res: Response) => {
    let input = req.body;

    res.json(await IDB.Demo.create(input));
});

type OutputGet = IResponseBase<IResponse.IDemo.IDemo[]>;
export const getAllDemos = ErrorService.catchAsync(async (req: Request, res: Response<OutputGet>) => {
    let oriQuery = IDB.Demo.find();
    let queryService = await new QueryHelper<IDB.DemoDocument[], IDB.DemoDocument>(IDB.Demo.find(), req.query);
    let total: number = await oriQuery.countDocuments();

    queryService = queryService //
        .sort()
        .paginate();

    let result = await queryService.query;

    res.json({
        status: 'ok',
        total: total,
        page: queryService.page,
        limit: queryService.limit,
        data: result.map((item) => {
            return {
                id: item.id,
                name: item.name,
                createdAt: item.createdAt
            };
        }),
    });
});
