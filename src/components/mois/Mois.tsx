import styles from "./mois.module.scss";
import SheetData from "@/components/sheetboard/sheetData";

export interface MoisProps {
    selectedMonth: string
}

const getSpreadsheetIdAndRange = (month: string) => {
    const spreadsheetId = '1NSbrkreltnCwihnE9tC24sVdDb5Tp5zCknzOXJKc2dQ';

    const monthMap: { [key: string]: { spreadsheetId: string, range: string } } = {
        Janvier: { spreadsheetId, range: 'Janvier!A1:Z' },
        Fevrier: { spreadsheetId, range: 'Fevrier!A1:Z' },
        Mars: { spreadsheetId, range: 'Mars!A1:Z' },
        Avril: { spreadsheetId, range: 'Avril!A1:Z' },
        Mai: { spreadsheetId, range: 'Mai!A1:Z' },
        Juin: { spreadsheetId, range: 'Juin!A1:Z' },
        Juillet: { spreadsheetId, range: 'Juillet!A1:Z' },
        Aout: { spreadsheetId, range: 'Aout!A1:Z' },
        Septembre: { spreadsheetId, range: 'Septembre!A1:Z' },
        Octobre: { spreadsheetId, range: 'Octobre!A1:Z' },
        Novembre: { spreadsheetId, range: 'Novembre!A1:Z' },
        Decembre: { spreadsheetId, range: 'Decembre!A1:Z' },
    };
    return monthMap[month];
};

const Mois = (props: MoisProps) => {
    const selectedSpreadsheet = getSpreadsheetIdAndRange(props.selectedMonth);

    return (
        <main className={styles.main}>
            <h1 className={styles.sheetboard_title}>Tableau de bord - {props.selectedMonth} 2025</h1>
            <div className={styles.container}>
                <SheetData
                    spreadsheetId={selectedSpreadsheet.spreadsheetId}
                    range={selectedSpreadsheet.range}
                />
            </div>
        </main>
    )
}

export default Mois;