import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSheetData, updateSheetData, updateCell } from '@/context/sheetSlice';
import styles from './sheetData.module.scss';
import EditModal from '@/components/modal/Modal';

export interface SheetDataProps {
    spreadsheetId: string;
    range: string;
}

interface RootState {
    sheet: {
        data: string[][];
    };
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
    const dispatch = useDispatch();
    const data = useSelector((state: RootState) => state.sheet.data);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState<RowData | null>(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

    useEffect(() => {
        if (spreadsheetId && range) {
            dispatch(fetchSheetData({ spreadsheetId, range }) as any);
        }
    }, [dispatch, spreadsheetId, range]);

    const handleCellChange = (event: React.FocusEvent<HTMLDivElement>, rowIndex: number, cellIndex: number) => {
        const value = event.target.innerText;
        dispatch(updateCell({ rowIndex, cellIndex, value }));

        const newRange = `${range.split('!')[0]}!${String.fromCharCode(65 + cellIndex)}${rowIndex + 1}`;
        dispatch(updateSheetData({ spreadsheetId, range: newRange, values: [[value]] }) as any);
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

    const handleModalSave = (formData: RowData) => {
        if (selectedRowIndex === null) return;

        const updatedValues = [
            formData.selection,
            formData.evenement,
            formData.client,
            formData.contact,
            formData.observation
        ];

        updatedValues.forEach((value, index) => {
            const cellIndex = index + 2;
            dispatch(updateCell({
                rowIndex: selectedRowIndex,
                cellIndex,
                value
            }));

            const newRange = `${range.split('!')[0]}!${String.fromCharCode(65 + cellIndex)}${selectedRowIndex + 1}`;
            dispatch(updateSheetData({
                spreadsheetId,
                range: newRange,
                values: [[value]]
            }) as any);
        });
    };

    return (
        <>
            <table className={styles.sheetboard}>
                <thead>
                <tr className={styles.sheetboard_row}>
                    {data[0] && data[0].map((header: string, index: number) => (
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
                                    contentEditable={cellIndex > 1}
                                    suppressContentEditableWarning
                                    onBlur={(e) => cellIndex > 1 && handleCellChange(e, rowIndex + 1, cellIndex)}
                                    className={styles.editableCell}
                                    onClick={(e) => {
                                        if (cellIndex > 1) {
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
            />
        </>
    );
}

export default SheetData;