import React, { useState } from 'react';
import styles from "@/components/tabs/mois/mois.module.scss";
import SheetData from "@/components/sheetboard/sheetData";

export interface JourProps {
    selectedDay: number;
}

const getSpreadsheetIdAndRange = (day: number) => {
    const spreadsheetId = '1NSbrkreltnCwihnE9tC24sVdDb5Tp5zCknzOXJKc2dQ';
    const range = `Janvier!A${day}:Z${day}`;
    return { spreadsheetId, range };
};

const Jour = (props: JourProps) => {
    const [selectedDay, setSelectedDay] = useState(props.selectedDay);
    const selectedSpreadsheet = getSpreadsheetIdAndRange(selectedDay);

    function onDayChange(day: number) {
        setSelectedDay(day);
    }

    return (
        <main className={styles.main}>
            <h1 className={styles.sheetboard_title}>Tableau de bord - Jour {selectedDay}</h1>
            <div className={styles.container}>
                <div className={styles.pointer_events}></div>
                <SheetData
                    spreadsheetId={selectedSpreadsheet.spreadsheetId}
                    range={selectedSpreadsheet.range}
                />
            </div>
            <div>
                <button onClick={() => onDayChange(selectedDay - 1)}>Jour Précédent</button>
                <button onClick={() => onDayChange(selectedDay + 1)}>Jour Suivant</button>
            </div>
        </main>
    );
}

export default Jour;