export namespace Utility {
    /**
     * kill this process
     */
    export function killServer(): void {
        process.exit(0);
    }

    /**
     * isNull
     * @description check whether data is null or undefined
     * @param data
     */
    export function isNullOrUndefined(data: any): boolean {
        return data === null || data === undefined;
    }

    /**
     * delay
     * @param ms milliseconds
     */
    export async function delay(ms: number): Promise<void> {
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                return resolve();
            }, ms);
        });
    }

    export function convertEnumValueToArray<T>(target: T) {
        let result: string[] = [];
        Object.keys(target).forEach((key) => {
            result.push(target[key]);
        });

        return result;
    }
}
