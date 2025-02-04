import { google } from 'googleapis';

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
let auth: any = null;
let sheetsApi: any = null;

export function getGoogleAuth() {
    if (!auth) {
        auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
    }
    return auth;
}

export function getGoogleSheets() {
    if (!sheetsApi) {
        const auth = getGoogleAuth();
        sheetsApi = google.sheets({ version: 'v4', auth });
    }
    return sheetsApi;
}