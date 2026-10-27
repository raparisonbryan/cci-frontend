import React, {useCallback, useEffect, useState} from 'react';
import styles from './sheetData.module.scss';
import EditModal from '@/components/modal/Modal';
import { Skeleton, message } from "antd";
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
    const userRole = session?.user?.role;
    const isAdmin = userRole === 'admin';
    const isUser = userRole === 'user';
    const isVisitor = userRole === 'visitor';
    const { ws, sendMessage } = useWebSocket();
    const [data, setData] = useState<string[][]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState<RowData | null>(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchSheetData = useCallback(async () => {
        try {
            const params = new URLSearchParams({ spreadsheetId, range });
            const response = await fetch(`${API_URL}/api/sheets?${params}`, { credentials: 'include' });
            if (!response.ok) {
                throw new Error(await response.text() || `HTTP ${response.status}`);
            }
            const sheetData = await response.json();
            setData(Array.isArray(sheetData) ? sheetData : []);
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            message.error('Impossible de charger le planning.');
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, spreadsheetId, range]);

    const postSheet = async (path: string, body: object) => {
        const response = await fetch(`${API_URL}/api/sheets${path}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ spreadsheetId, ...body })
        });
        if (!response.ok) {
            const error = new Error(await response.text() || `HTTP ${response.status}`);
            (error as Error & { status?: number }).status = response.status;
            throw error;
        }
    };

    // 409 : la ligne a changé côté Sheet (ajout/suppression/modification par quelqu'un d'autre)
    const isConflict = (error: unknown) => (error as { status?: number })?.status === 409;

    // Diffuse la modification aux autres clients et l'ajoute à l'historique local
    const notifyChange = (change: Record<string, unknown>) => {
        sendMessage(change);
        saveChangeToLocalHistory({
            ...change,
            user: session?.user?.name ?? 'Utilisateur inconnu',
            userEmail: session?.user?.email,
            userImage: session?.user?.image,
            timestamp: new Date().toISOString(),
        });
    };

    useEffect(() => {
        if (ws) {
            const messageHandler = (event: MessageEvent) => {
                let update;
                try {
                    update = JSON.parse(event.data);
                } catch (error) {
                    console.error('Invalid WebSocket message:', error);
                    return;
                }

                if (update.spreadsheetId !== spreadsheetId || update.sheetName !== range.split('!')[0]) {
                    return;
                }

                if (update.type === 'UPDATE_CELL') {
                    setData(prevData => prevData.map((row, index) => {
                        if (index !== update.rowIndex) return row;
                        const newRow = [...row];
                        newRow[update.cellIndex] = update.value;
                        return newRow;
                    }));
                } else if (update.type === 'INSERT_ROW' || update.type === 'DELETE_ROW') {
                    fetchSheetData();
                }
            };

            ws.addEventListener('message', messageHandler);

            return () => {
                ws.removeEventListener('message', messageHandler);
            };
        }
    }, [ws, fetchSheetData, spreadsheetId, range]);

    useEffect(() => {
        fetchSheetData();
    }, [fetchSheetData]);

    const handleCellChange = async (event: React.FocusEvent<HTMLDivElement>, rowIndex: number, cellIndex: number) => {
        const value = event.target.innerText;

        if (value === String(data[rowIndex]?.[cellIndex] ?? '')) return;

        setData(prevData => prevData.map((row, index) => {
            if (index !== rowIndex) return row;
            const newRow = [...row];
            newRow[cellIndex] = value;
            return newRow;
        }));

        const sheetName = range.split('!')[0];
        const cellReference = `${String.fromCharCode(65 + cellIndex)}${rowIndex + 1}`;
        const newRange = `${sheetName}!${cellReference}`;

        try {
            await postSheet('', { range: newRange, values: [[value]] });
        } catch (error) {
            console.error('Error updating cell:', error);
            message.error("La modification n'a pas été enregistrée.");
            await fetchSheetData();
            return;
        }

        notifyChange({
            type: 'UPDATE_CELL',
            rowIndex,
            cellIndex,
            value,
            spreadsheetId,
            range: newRange,
            sheetName,
            cellReference,
            fieldName: cellIndex < data[0].length ? data[0][cellIndex] : `Colonne ${cellIndex + 1}`
        });
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
        const fieldNames = ['date', 'jour', 'selection', 'evenement', 'client', 'contact', 'observation'];

        const previousRow = data[selectedRowIndex] ?? [];
        const changedIndexes = updatedValues
            .map((value, index) => (value !== String(previousRow[index] ?? '') ? index : -1))
            .filter(index => index !== -1);

        setIsModalOpen(false);
        if (changedIndexes.length === 0) return;

        const sheetName = range.split('!')[0];
        const rowNumber = selectedRowIndex + 1;
        const rowRange = `${sheetName}!A${rowNumber}:${String.fromCharCode(65 + updatedValues.length - 1)}${rowNumber}`;

        try {
            await postSheet('', { range: rowRange, values: [updatedValues] });
        } catch (error) {
            console.error('Error saving row:', error);
            message.error("Les modifications n'ont pas été enregistrées.");
            return;
        }

        setData(prevData => prevData.map((row, index) => {
            if (index !== selectedRowIndex) return row;
            const newRow = [...row];
            updatedValues.forEach((value, cellIndex) => {
                newRow[cellIndex] = value;
            });
            return newRow;
        }));

        changedIndexes.forEach(i => {
            const cellReference = `${String.fromCharCode(65 + i)}${rowNumber}`;
            notifyChange({
                type: 'UPDATE_CELL',
                rowIndex: selectedRowIndex,
                cellIndex: i,
                value: updatedValues[i],
                spreadsheetId,
                range: `${sheetName}!${cellReference}`,
                sheetName,
                cellReference,
                fieldName: fieldNames[i],
                source: 'modal'
            });
        });
    };

    const handleInsertRow = async () => {
        if (selectedRowIndex === null || !data[0]) return;

        const sheetName = range.split('!')[0];
        const insertPosition = selectedRowIndex + 1;
        const emptyRow = Array(data[0].length).fill('');
        emptyRow[0] = data[selectedRowIndex][0];
        emptyRow[1] = data[selectedRowIndex][1];
        const insertRange = `${sheetName}!A${insertPosition}:${String.fromCharCode(65 + data[0].length - 1)}${insertPosition}`;

        try {
            await postSheet('/insert', {
                range: `${sheetName}!A${insertPosition}`,
                expectedRow: data[selectedRowIndex],
                values: emptyRow
            });

            notifyChange({
                type: 'INSERT_ROW',
                spreadsheetId,
                range: insertRange,
                sheetName,
                position: insertPosition,
                rowReference: `Ligne ${insertPosition}`
            });
        } catch (error) {
            console.error('Error inserting row:', error);
            message.error(isConflict(error)
                ? "Le planning a été modifié entre-temps, aucune ligne n'a été ajoutée. Les données ont été rechargées."
                : "La ligne n'a pas pu être ajoutée.");
        }

        await fetchSheetData();
        setIsModalOpen(false);
    };

    const handleDeleteRow = async () => {
        if (!isAdmin) {
            console.error('Permission denied: Only administrators can delete rows');
            alert('Seuls les administrateurs peuvent supprimer des lignes');
            return;
        }

        if (selectedRowIndex === null) return;

        const sheetName = range.split('!')[0];
        const deleteRange = `${sheetName}!A${selectedRowIndex + 1}`;

        try {
            await postSheet('/delete', { range: deleteRange, expectedRow: data[selectedRowIndex] });

            notifyChange({
                type: 'DELETE_ROW',
                spreadsheetId,
                range: deleteRange,
                sheetName,
                rowIndex: selectedRowIndex,
                rowReference: `Ligne ${selectedRowIndex + 1}`
            });
        } catch (error) {
            console.error('Error deleting row:', error);
            message.error(isConflict(error)
                ? "Le planning a été modifié entre-temps, la ligne n'a pas été supprimée. Les données ont été rechargées."
                : "La ligne n'a pas pu être supprimée.");
        }

        await fetchSheetData();
        setIsModalOpen(false);
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
        if (isVisitor) return false;
        if (isAdmin) return cellIndex > 1;
        if (isUser && cellContent && String(cellContent).trim().length > 0) {
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
            {isUser && (
                <div className={styles.userMessage}>
                    <p className={styles.infoText}>
                        Vous pouvez seulement ajouter du contenu dans les cellules vides.
                    </p>
                </div>
            )}

            {isVisitor && (
                <div className={styles.userMessage}>
                    <p className={styles.infoText}>
                        Vous êtes en mode lecture seule. Vous ne pouvez pas modifier les données.
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

            {!isVisitor && (
                <EditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    rowData={selectedRowData as RowData}
                    onSave={handleModalSave}
                    onInsertRow={handleInsertRow}
                    onDeleteRow={handleDeleteRow}
                />
            )}
        </>
    );
};

export default SheetData;