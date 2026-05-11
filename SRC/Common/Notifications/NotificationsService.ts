import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import path from "node:path";
import { unknown } from "zod";

class NotificationsService {
  private _serviceAccount = JSON.parse(
    readFileSync(
      path.resolve("./social-53e4d-firebase-adminsdk-fbsvc-58ab5ccfe9.json"),
    ) as unknown as string, //transfere to object
  );
  private _Client: admin.app.App;
  constructor() {
    this._Client = admin.initializeApp({
      credential: admin.credential.cert(this._serviceAccount),
    });
  }
  async SendNotification({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }) {
    return await this._Client.messaging().send({ token, data });
  }
  async SendNotifications({
    tokens,
    data,
  }: {
    tokens: string[];
    data: { title: string; body: string };
  }) {
    return await Promise.all(
      tokens.map((token) => {
        return this.SendNotification({ token, data });
      }),
    );
  }
}

export default new NotificationsService()
