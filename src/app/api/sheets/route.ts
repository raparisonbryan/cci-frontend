import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import credentials from '@/config/credentials.json';

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const spreadsheetId = searchParams.get('spreadsheetId');
        const range = searchParams.get('range');

        if (!spreadsheetId || !range) {
            return NextResponse.json(
                { error: "Missing spreadsheetId or range" },
                { status: 400 }
            );
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            valueRenderOption: 'UNFORMATTED_VALUE',
            dateTimeRenderOption: 'FORMATTED_STRING',
            majorDimension: 'ROWS',
        });

        const headers = response.data.values?.[0] || [];
        const formattedValues = response.data.values?.map(row => {
            while (row.length < headers.length) {
                row.push('');
            }
            return row;
        }) || [];

        return NextResponse.json(formattedValues);
    } catch (error) {
        return NextResponse.json(
            { error: "Error retrieving sheet data" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { spreadsheetId, range, values } = await request.json();

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: {
                values,
            },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        return NextResponse.json(
            { error: "Error updating sheet data" },
            { status: 500 }
        );
    }
}