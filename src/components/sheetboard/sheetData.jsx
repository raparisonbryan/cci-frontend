'use client'

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSheetData, updateSheetData, updateCell } from '@/context/sheetSlice';
import styles from './sheetData.module.scss'; 

export default function SheetData({ spreadsheetId, range }) {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.sheet.data);

  useEffect(() => {
    if (spreadsheetId && range) {
      dispatch(fetchSheetData({ spreadsheetId, range }));
    }
  }, [dispatch, spreadsheetId, range]);

  const handleCellChange = (event, rowIndex, cellIndex) => {
    const value = event.target.innerText;
    dispatch(updateCell({ rowIndex, cellIndex, value }));

    const newRange = `${range.split('!')[0]}!${String.fromCharCode(65 + cellIndex)}${rowIndex + 1}`;
    dispatch(updateSheetData({ spreadsheetId, range: newRange, values: [[value]] }));
  };

  return (
    <table className={styles.sheetboard}>
        <thead>
          <tr className={styles.sheetboard_row}>
            {data[0] && data[0].map((header, index) => (
              <th className={styles.sheetboard_content} key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr className={styles.sheetboard_row} key={rowIndex}>
              {row.map((cell, cellIndex) => (
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
