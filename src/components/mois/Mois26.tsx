import styles from "./mois.module.scss";
import SheetData from "@/components/sheetboard/sheetData";

export interface MoisProps {
    selectedMonth: string
}

const getSpreadsheetIdAndRange = (month: string) => {
    const spreadsheetId = '1NSbrkreltnCwihnE9tC24sVdDb5Tp5zCknzOXJKc2dQ';

    const monthMap: { [key: string]: { spreadsheetId: string, range: string } } = {
        Janvier: { spreadsheetId, range: 'Janvier26!A1:Z' },
        Fevrier: { spreadsheetId, range: 'Fevrier26!A1:Z' },
        Mars: { spreadsheetId, range: 'Mars26!A1:Z' },
        Avril: { spreadsheetId, range: 'Avril26!A1:Z' },
        Mai: { spreadsheetId, range: 'Mai26!A1:Z' },
        Juin: { spreadsheetId, range: 'Juin26!A1:Z' },
        Juillet: { spreadsheetId, range: 'Juillet26!A1:Z' },
        Aout: { spreadsheetId, range: 'Aout26!A1:Z' },
        Septembre: { spreadsheetId, range: 'Septembre26!A1:Z' },
        Octobre: { spreadsheetId, range: 'Octobre26!A1:Z' },
        Novembre: { spreadsheetId, range: 'Novembre26!A1:Z' },
        Decembre: { spreadsheetId, range: 'Decembre26!A1:Z' },
    };
    return monthMap[month];
};

const Mois = (props: MoisProps) => {
    const selectedSpreadsheet = getSpreadsheetIdAndRange(props.selectedMonth);

    return (
        <main className={styles.main}>
            <h1 className={styles.sheetboard_title}>Tableau de bord - {props.selectedMonth} 2026</h1>
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