import { NextResponse } from 'next/server';
import { getGoogleSheets } from '@/utils/googleAuth';
import { cache } from 'react';

const getData = cache(async (spreadsheetId: string, range: string) => {
    const sheets = getGoogleSheets();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
        valueRenderOption: 'UNFORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
        majorDimension: 'ROWS',
    });

    const headers = response.data.values?.[0] || [];
    return response.data.values?.map((row: string[]) => {
        while (row.length < headers.length) {
            row.push('');
        }
        return row;
    }) || [];
});

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

        const data = await getData(spreadsheetId, range);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Error retrieving sheet data" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const sheets = getGoogleSheets();
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