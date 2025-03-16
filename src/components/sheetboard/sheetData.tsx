import React, {useCallback, useEffect, useState} from 'react';
import styles from './sheetData.module.scss';
import EditModal from '@/components/modal/Modal';
import { Skeleton } from "antd";
import { useSession } from 'next-auth/react';

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

    const [data, setData] = useState<string[][]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);
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
        fetchSheetData();

        const socket = new WebSocket('wss://cci-api.com/socket');

        socket.onopen = () => {
            console.log('WebSocket connected');
            setWs(socket);
        };

        socket.onmessage = (event) => {
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

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (socket) socket.close();
        };
    }, [spreadsheetId, range, fetchSheetData]);

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

        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'UPDATE_CELL',
                rowIndex,
                cellIndex,
                value,
                spreadsheetId,
                range: newRange
            }));
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

            if (ws?.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'UPDATE_CELL',
                    rowIndex: selectedRowIndex,
                    cellIndex: i,
                    value: updatedValues[i],
                    spreadsheetId,
                    range: newRange
                }));
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

            ws?.send(JSON.stringify({
                type: 'INSERT_ROW',
                spreadsheetId,
                range
            }));

            await fetchSheetData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error inserting row:', error);
        }
    };

    const handleDeleteRow = async () => {
        // Vérification que l'utilisateur est admin avant de permettre la suppression
        if (!isAdmin) {
            console.error('Permission denied: Only administrators can delete rows');
            alert('Seuls les administrateurs peuvent supprimer des lignes');
            return;
        }

        if (selectedRowIndex === null) return;

        try {
            await fetch('https://cci-api.com/api/sheets/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spreadsheetId,
                    range: `${range.split('!')[0]}!A${selectedRowIndex + 1}`,
                })
            });

            ws?.send(JSON.stringify({
                type: 'DELETE_ROW',
                spreadsheetId,
                range
            }));

            await fetchSheetData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error deleting row:', error);
        }
    };

    // Détermine si une cellule doit être éditable
    const isCellEditable = (cellIndex: number, cellContent: string) => {
        if (!isAdmin && cellContent && cellContent.trim().length > 0) {
            return false; // Non éditable si l'utilisateur n'est pas admin et la cellule contient déjà du texte
        }
        return cellIndex > 1; // Les deux premières colonnes ne sont pas éditables (comme dans votre code original)
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