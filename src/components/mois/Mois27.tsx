import styles from "./mois.module.scss";
import SheetData from "@/components/sheetboard/sheetData";

export interface MoisProps {
    selectedMonth: string
}

const getSpreadsheetIdAndRange = (month: string) => {
    const spreadsheetId = '1NSbrkreltnCwihnE9tC24sVdDb5Tp5zCknzOXJKc2dQ';

    const monthMap: { [key: string]: { spreadsheetId: string, range: string } } = {
        Janvier: { spreadsheetId, range: 'Janvier27!A1:Z99' },
        Fevrier: { spreadsheetId, range: 'Fevrier27!A1:Z99' },
        Mars: { spreadsheetId, range: 'Mars27!A1:Z99' },
        Avril: { spreadsheetId, range: 'Avril27!A1:Z99' },
        Mai: { spreadsheetId, range: 'Mai27!A1:Z99' },
        Juin: { spreadsheetId, range: 'Juin27!A1:Z99' },
        Juillet: { spreadsheetId, range: 'Juillet27!A1:Z99' },
        Aout: { spreadsheetId, range: 'Aout27!A1:Z99' },
        Septembre: { spreadsheetId, range: 'Septembre27!A1:Z99' },
        Octobre: { spreadsheetId, range: 'Octobre27!A1:Z99' },
        Novembre: { spreadsheetId, range: 'Novembre27!A1:Z99' },
        Decembre: { spreadsheetId, range: 'Decembre27!A1:Z99' },
    };
    return monthMap[month];
};

const Mois = (props: MoisProps) => {
    const selectedSpreadsheet = getSpreadsheetIdAndRange(props.selectedMonth);

    return (
        <main className={styles.main}>
            <h1 className={styles.sheetboard_title}>Tableau de bord - {props.selectedMonth} 2027</h1>
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