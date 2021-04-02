import { LoginTicket, OAuth2Client } from 'google-auth-library';
import Axios from 'axios';

export class GoogleAuthHelper {
    /**
     *
     */
    private _client: OAuth2Client = undefined;

    private _clientId: string = '';

    constructor(clientId: string) {
        this._clientId = clientId;

        this._client = new OAuth2Client(clientId);
    }

    /**
     *
     * @param token
     */
    public async verify(token: string): Promise<LoginTicket> {
        try {
            const ticket: LoginTicket = await this._client.verifyIdToken({
                idToken: token,
                audience: this._clientId, // Specify the CLIENT_ID of the app that accesses the backend
            });

            return ticket;
        } catch (error) {
            throw error;
        }
    }

    /**
     * get picture
     * @param url 
     * @returns 
     */
    public async getPicture(url: string): Promise<Buffer> {
        try {
            let result = await Axios.get(url, {
                responseType: 'arraybuffer',
            });
            if (!result.data) {
                throw 'no any data';
            }

            return Buffer.from(result.data, 'base64');
        } catch (error) {
            throw error;
        }
    }
}
