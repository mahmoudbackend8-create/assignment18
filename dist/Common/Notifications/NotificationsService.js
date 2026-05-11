import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import path from "node:path";
import { unknown } from "zod";
class NotificationsService {
    _serviceAccount = JSON.parse(readFileSync(path.resolve("./social-53e4d-firebase-adminsdk-fbsvc-58ab5ccfe9.json")));
    _Client;
    constructor() {
        this._Client = admin.initializeApp({
            credential: admin.credential.cert(this._serviceAccount),
        });
    }
    async SendNotification({ token, data, }) {
        return await this._Client.messaging().send({ token, data });
    }
    async SendNotifications({ tokens, data, }) {
        return await Promise.all(tokens.map((token) => {
            return this.SendNotification({ token, data });
        }));
    }
}
export default new NotificationsService();
