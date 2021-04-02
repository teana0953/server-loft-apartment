import Sharp from 'sharp';

export namespace PhotoHelper {
    export interface IResizeConfig extends ISize {
        format: 'jpeg' | 'png';
    }

    export interface ISize {
        width: number;
        height: number;
    }

    /**
     * Resize
     * @param buffer 
     * @param config 
     * @returns 
     */
    export async function resize(
        buffer: Buffer,
        config: IResizeConfig,
    ): Promise<Buffer> {
        try {
            let width: number = config.width || 120;
            let height: number = config.height || 120;
            let format = config.format || 'png';

            return await Sharp(buffer)
                .resize(width, height)
                .toFormat(format)
                .toBuffer();
        } catch (e) {
            throw e;
        }
    }
}
