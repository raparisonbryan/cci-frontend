import React, {useCallback, useEffect, useState} from 'react';
import styles from './sheetData.module.scss';
import EditModal from '@/components/modal/Modal';
import { Skeleton } from "antd";
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';

export interface SheetDataProps {
    spreadsheetId: string;
    range: string;
}

interface RowData {
    date: string;
    jour: string;
    selection: string;
    evenement: string;
    client: string;
    contact: string;
    observation: string;
}

const SheetData = ({ spreadsheetId, range }: SheetDataProps) => {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const { ws, isConnected, sendMessage } = useWebSocket();
    const [data, setData] = useState<string[][]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState<RowData | null>(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSheetData = useCallback(async () => {
        try {
            const response = await fetch(`https://cci-api.com/api/sheets?spreadsheetId=${spreadsheetId}&range=${range}`);
            const sheetData = await response.json();
            setData(sheetData);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            setIsLoading(false);
        }
    }, [spreadsheetId, range]);

    useEffect(() => {
        if (ws) {
            const messageHandler = (event: MessageEvent) => {
                const update = JSON.parse(event.data);

                if (update.type === 'UPDATE_CELL') {
                    setData(prevData => {
                        const newData = [...prevData];
                        if (newData[update.rowIndex]) {
                            newData[update.rowIndex][update.cellIndex] = update.value;
                        }
                        return newData;
                    });
                } else if (update.type === 'INSERT_ROW' || update.type === 'DELETE_ROW') {
                    fetchSheetData();
                }
            };

            ws.addEventListener('message', messageHandler);

            return () => {
                ws.removeEventListener('message', messageHandler);
            };
        }
    }, [ws, fetchSheetData]);

    useEffect(() => {
        fetchSheetData();
    }, [fetchSheetData]);

    const handleCellChange = async (event: React.FocusEvent<HTMLDivElement>, rowIndex: number, cellIndex: number) => {
        const value = event.target.innerText;

        setData(prevData => {
            const newData = [...prevData];
            newData[rowIndex][cellIndex] = value;
            return newData;
        });

        const newRange = `${range.split('!')[0]}!${String.fromCharCode(65 + cellIndex)}${rowIndex + 1}`;
        await fetch('https://cci-api.com/api/sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                spreadsheetId,
                range: newRange,
                values: [[value]]
            })
        });

        if (isConnected) {
            sendMessage({
                type: 'UPDATE_CELL',
                rowIndex,
                cellIndex,
                value,
                spreadsheetId,
                range: newRange,
                sheetName: range.split('!')[0],
                cellReference: `${String.fromCharCode(65 + cellIndex)}${rowIndex + 1}`,
                fieldName: cellIndex < data[0].length ? data[0][cellIndex] : `Colonne ${cellIndex + 1}`
            });

            saveChangeToLocalHistory({
                type: 'UPDATE_CELL',
                user: session?.user?.name || 'Utilisateur inconnu',
                userEmail: session?.user?.email,
                userImage: session?.user?.image,
                timestamp: new Date().toISOString(),
                spreadsheetId,
                range: newRange,
                rowIndex,
                cellIndex,
                value,
                cellReference: `${String.fromCharCode(65 + cellIndex)}${rowIndex + 1}`,
                fieldName: cellIndex < data[0].length ? data[0][cellIndex] : `Colonne ${cellIndex + 1}`
            });
        }
    };

    const handleRowClick = (rowIndex: number) => {
        const rowData = {
            date: data[rowIndex][0],
            jour: data[rowIndex][1],
            selection: data[rowIndex][2],
            evenement: data[rowIndex][3],
            client: data[rowIndex][4],
            contact: data[rowIndex][5],
            observation: data[rowIndex][6]
        };
        setSelectedRowData(rowData);
        setSelectedRowIndex(rowIndex);
        setIsModalOpen(true);
    };

    const handleModalSave = async (formData: RowData) => {
        if (selectedRowIndex === null) return;

        const updatedValues = [
            formData.date,
            formData.jour,
            formData.selection,
            formData.evenement,
            formData.client,
            formData.contact,
            formData.observation
        ];

        setData(prevData => {
            const newData = [...prevData];
            updatedValues.forEach((value, index) => {
                newData[selectedRowIndex][index] = value;
            });
            return newData;
        });

        const fieldNames = ['date', 'jour', 'selection', 'evenement', 'client', 'contact', 'observation'];

        for (let i = 0; i < updatedValues.length; i++) {
            const newRange = `${range.split('!')[0]}!${String.fromCharCode(65 + i)}${selectedRowIndex + 1}`;
            await fetch('https://cci-api.com/api/sheets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spreadsheetId,
                    range: newRange,
                    values: [[updatedValues[i]]]
                })
            });

            if (isConnected) {
                sendMessage({
                    type: 'UPDATE_CELL',
                    rowIndex: selectedRowIndex,
                    cellIndex: i,
                    value: updatedValues[i],
                    spreadsheetId,
                    range: newRange,
                    sheetName: range.split('!')[0],
                    cellReference: `${String.fromCharCode(65 + i)}${selectedRowIndex + 1}`,
                    fieldName: fieldNames[i],
                    source: 'modal'
                });

                saveChangeToLocalHistory({
                    type: 'UPDATE_CELL',
                    user: session?.user?.name || 'Utilisateur inconnu',
                    userEmail: session?.user?.email,
                    userImage: session?.user?.image,
                    timestamp: new Date().toISOString(),
                    spreadsheetId,
                    range: newRange,
                    rowIndex: selectedRowIndex,
                    cellIndex: i,
                    value: updatedValues[i],
                    cellReference: `${String.fromCharCode(65 + i)}${selectedRowIndex + 1}`,
                    fieldName: fieldNames[i],
                    source: 'modal'
                });
            }
        }

        setIsModalOpen(false);
    };

    const handleInsertRow = async () => {
        if (selectedRowIndex === null) return;

        try {
            const insertPosition = selectedRowIndex + 1;
            const emptyRow = Array(data[0].length).fill('');
            emptyRow[0] = data[selectedRowIndex][0];
            emptyRow[1] = data[selectedRowIndex][1];

            await fetch('https://cci-api.com/api/sheets/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spreadsheetId,
                    range: `${range.split('!')[0]}!A${insertPosition}`,
                })
            });

            const insertRange = `${range.split('!')[0]}!A${insertPosition}:${String.fromCharCode(65 + data[0].length - 1)}${insertPosition}`;
            await fetch('https://cci-api.com/api/sheets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spreadsheetId,
                    range: insertRange,
                    values: [emptyRow]
                })
            });

            if (isConnected) {
                sendMessage({
                    type: 'INSERT_ROW',
                    spreadsheetId,
                    range: insertRange,
                    sheetName: range.split('!')[0],
                    position: insertPosition,
                    rowReference: `Ligne ${insertPosition}`
                });

                saveChangeToLocalHistory({
                    type: 'INSERT_ROW',
                    user: session?.user?.name || 'Utilisateur inconnu',
                    userEmail: session?.user?.email,
                    userImage: session?.user?.image,
                    timestamp: new Date().toISOString(),
                    spreadsheetId,
                    range: insertRange,
                    position: insertPosition,
                    sheetName: range.split('!')[0],
                    rowReference: `Ligne ${insertPosition}`
                });
            }

            await fetchSheetData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error inserting row:', error);
        }
    };

    const handleDeleteRow = async () => {
        if (!isAdmin) {
            console.error('Permission denied: Only administrators can delete rows');
            alert('Seuls les administrateurs peuvent supprimer des lignes');
            return;
        }

        if (selectedRowIndex === null) return;

        try {
            const deleteRange = `${range.split('!')[0]}!A${selectedRowIndex + 1}`;

            await fetch('https://cci-api.com/api/sheets/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spreadsheetId,
                    range: deleteRange,
                })
            });

            if (isConnected) {
                sendMessage({
                    type: 'DELETE_ROW',
                    spreadsheetId,
                    range: deleteRange,
                    sheetName: range.split('!')[0],
                    rowIndex: selectedRowIndex,
                    rowReference: `Ligne ${selectedRowIndex + 1}`
                });

                saveChangeToLocalHistory({
                    type: 'DELETE_ROW',
                    user: session?.user?.name || 'Utilisateur inconnu',
                    userEmail: session?.user?.email,
                    userImage: session?.user?.image,
                    timestamp: new Date().toISOString(),
                    spreadsheetId,
                    range: deleteRange,
                    rowIndex: selectedRowIndex,
                    sheetName: range.split('!')[0],
                    rowReference: `Ligne ${selectedRowIndex + 1}`
                });
            }

            await fetchSheetData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error deleting row:', error);
        }
    };

    const saveChangeToLocalHistory = (changeData: any) => {
        try {
            const changeId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const existingChanges = localStorage.getItem('recentChanges');
            let changesArray = existingChanges ? JSON.parse(existingChanges) : [];

            changesArray.unshift({
                id: changeId,
                ...changeData
            });

            changesArray = changesArray.slice(0, 50);

            localStorage.setItem('recentChanges', JSON.stringify(changesArray));
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la modification dans l\'historique local:', error);
        }
    };

    const isCellEditable = (cellIndex: number, cellContent: string) => {
        if (!isAdmin && cellContent && cellContent.trim().length > 0) {
            return false;
        }
        return cellIndex > 1;
    };

    if (isLoading) {
        return (
            <table className={styles.sheetboard}>
                <thead>
                <tr className={styles.sheetboard_row}>
                    <th className={styles.sheetboard_content}>Date</th>
                    <th className={styles.sheetboard_content}>Jour</th>
                    <th className={styles.sheetboard_content}>Sélection</th>
                    <th className={styles.sheetboard_content}>Évènement</th>
                    <th className={styles.sheetboard_content}>Client</th>
                    <th className={styles.sheetboard_content}>Contact</th>
                    <th className={styles.sheetboard_content}>Observation</th>
                </tr>
                </thead>
                <tbody>
                {[...Array(10)].map((_, index) => (
                    <tr key={index} className={styles.skeleton}>
                        <td className={styles.skeleton}>
                            <Skeleton.Input block={true} active />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    }

    return (
        <>
            {!isAdmin && (
                <div className={styles.userMessage}>
                    <p className={styles.infoText}>
                        Vous ne pouvez pas modifier les champs qui contiennent déjà du texte.
                    </p>
                </div>
            )}

            <table className={styles.sheetboard}>
                <thead>
                <tr className={styles.sheetboard_row}>
                    {data[0]?.map((header: string, index: number) => (
                        <th className={styles.sheetboard_content} key={index}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.slice(1).map((row: string[], rowIndex: number) => (
                    <tr
                        className={`${styles.sheetboard_row} ${styles.clickable}`}
                        key={rowIndex}
                        onClick={() => handleRowClick(rowIndex + 1)}
                    >
                        {row.map((cell: string, cellIndex: number) => (
                            <td
                                className={styles.sheetboard_content}
                                key={cellIndex}
                            >
                                <div
                                    contentEditable={isCellEditable(cellIndex, cell)}
                                    suppressContentEditableWarning
                                    onBlur={(e) => isCellEditable(cellIndex, cell) && handleCellChange(e, rowIndex + 1, cellIndex)}
                                    className={`${styles.editableCell} ${!isCellEditable(cellIndex, cell) && cellIndex > 1 ? styles.readOnly : ''}`}
                                    onClick={(e) => {
                                        if (isCellEditable(cellIndex, cell)) {
                                            e.stopPropagation();
                                        }
                                    }}
                                >
                                    {cell || ''}
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>

            <EditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                rowData={selectedRowData as RowData}
                onSave={handleModalSave}
                onInsertRow={handleInsertRow}
                onDeleteRow={handleDeleteRow}
            />
        </>
    );
};

export default SheetData;