import { Query, Document } from 'mongoose';

export class QueryHelper<T, U extends Document> {
    /**
     *
     */
    public query: Query<T, U> = undefined;

    /**
     *
     */
    private queryString: any = undefined;

    /**
     *
     */
    private _page: number = 1;
    public get page(): number {
        return this._page;
    }

    /**
     *
     */
    private _limit: number = 1;
    public get limit(): number {
        return this._limit;
    }

    /**
     * for filter used
     */
    public readonly featureFields: string[] = ['page', 'limit', 'sort'];

    constructor(query: Query<T, U>, queryString: any) {
        this.query = query;
        this.queryString = queryString;
    }

    /**
     * sort
     * @description if want asc ex. name; desc ex. -name
     * @returns
     */
    public sort(): this {
        if (!this.queryString?.sort) return this;

        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);

        return this;
    }

    /**
     * paginate
     * @default page 1, min 1
     * @default limit 100, min 1
     * @returns
     */
    public paginate(): this {
        this.queryString.page = this.queryString.page || 0;
        this.queryString.limit = this.queryString.limit || 0;

        this._page = this.queryString.page * 1 || 1;
        this._limit = this.queryString.limit * 1 || 100;

        const skip = (this._page - 1) * this._limit;

        this.query = this.query.skip(skip).limit(this._limit);

        return this;
    }
}
