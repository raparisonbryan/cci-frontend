import SheetData from "@/components/sheetboard/sheetData";
import styles from "./main.module.scss";

const getSpreadsheetIdAndRange = (month) => {
    const spreadsheetId = '1NSbrkreltnCwihnE9tC24sVdDb5Tp5zCknzOXJKc2dQ';

    const monthMap = {
        Janvier: { spreadsheetId, range: 'Janvier!A1:Z99' },
        Fevrier: { spreadsheetId, range: 'Fevrier!A1:Z99' },
        Mars: { spreadsheetId, range: 'Mars!A1:Z99' },
        Avril: { spreadsheetId, range: 'Avril!A1:Z99' },
        Mai: { spreadsheetId, range: 'Mai!A1:Z99' },
        Juin: { spreadsheetId, range: 'Juin!A1:Z99' },
        Juillet: { spreadsheetId, range: 'Juillet!A1:Z99' },
        Août: { spreadsheetId, range: 'Août!A1:Z99' },
        Septembre: { spreadsheetId, range: 'Septembre!A1:Z99' },
        Octobre: { spreadsheetId, range: 'Octobre!A1:Z99' },
        Novembre: { spreadsheetId, range: 'Novembre!A1:Z99' },
        Decembre: { spreadsheetId, range: 'Decembre!A1:Z99' },
    };
    return monthMap[month];
};

export default function Main({ selectedMonth }) {
    const selectedSpreadsheet = getSpreadsheetIdAndRange(selectedMonth);

    return (
        <main className={styles.main}>
            <h1 className={styles.sheetboard_title}>Tableau de bord - {selectedMonth}</h1>
            <div className={styles.container}>
                <div className={styles.pointer_events}></div>
                <SheetData
                    spreadsheetId={selectedSpreadsheet.spreadsheetId}
                    range={selectedSpreadsheet.range}
                />
            </div>
        </main>
    );
}