import { google } from 'googleapis';

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
class GoogleSheetsService {
    private auth;
    private sheets;

    constructor() {
        this.auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    }

    async getSpreadSheetValues(spreadsheetId: string, range: string) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            return response.data.values;
        } catch (error) {
            console.error('Error getting spreadsheet values:', error);
            throw error;
        }
    }

    async updateSpreadSheetValues(spreadsheetId: string, range: string, values: any[][]) {
        try {
            const response = await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption: 'RAW',
                requestBody: {
                    values,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating spreadsheet values:', error);
            throw error;
        }
    }
}

const sheetService = new GoogleSheetsService();
export default sheetService;