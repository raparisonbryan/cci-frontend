'use client'

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSheetData, updateSheetData, updateCell } from '@/context/sheetSlice';
import styles from './sheetData.module.scss';

export interface SheetDataProps {
    spreadsheetId: string;
    range: string;
}

interface RootState {
    sheet: {
        data: string[][];
    };
}

const SheetData = ({ spreadsheetId, range }: SheetDataProps) => {
  const dispatch = useDispatch();
  const data = useSelector((state: RootState) => state.sheet.data);

  useEffect(() => {
    if (spreadsheetId && range) {
      dispatch(fetchSheetData({ spreadsheetId, range }) as any);
    }
  }, [dispatch, spreadsheetId, range]);

  const handleCellChange = (event: React.FocusEvent<HTMLTableCellElement>, rowIndex: number, cellIndex: number) => {
    const value = event.target.innerText;
    dispatch(updateCell({ rowIndex, cellIndex, value }));

    const newRange = `${range.split('!')[0]}!${String.fromCharCode(65 + cellIndex)}${rowIndex + 1}`;
    dispatch(updateSheetData({ spreadsheetId, range: newRange, values: [[value]] }) as any);
  };

  return (
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
            <tr className={styles.sheetboard_row} key={rowIndex}>
              {row.map((cell: string, cellIndex: number) => (
                <td
                  className={styles.sheetboard_content}
                  key={cellIndex}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleCellChange(e, rowIndex + 1, cellIndex)}
                >
                  {cell || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
    </table>
  );
}

export default SheetData;