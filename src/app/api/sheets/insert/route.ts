import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import credentials from '@/config/credentials.json';

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

export async function POST(request: Request) {
    try {
        const { spreadsheetId, range } = await request.json();
        const rowIndex = parseInt(range.split('!')[1].replace(/[^0-9]/g, '')) - 1;

        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    insertDimension: {
                        range: {
                            sheetId: 0,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1
                        }
                    }
                }]
            }
        });

        return NextResponse.json(response.data);
    } catch (error) {
        return NextResponse.json(
            { error: "Error inserting row" },
            { status: 500 }
        );
    }
}