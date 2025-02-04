import { NextResponse } from 'next/server';
import { getGoogleSheets } from '@/utils/googleAuth';

export async function POST(request: Request) {
    try {
        const sheets = getGoogleSheets();
        const { spreadsheetId, range } = await request.json();
        const rowIndex = parseInt(range.split('!')[1].replace(/[^0-9]/g, '')) - 1;

        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
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
            { error: "Error deleting row" },
            { status: 500 }
        );
    }
}