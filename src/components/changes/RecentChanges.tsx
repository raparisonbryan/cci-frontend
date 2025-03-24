"use client"

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useSession } from 'next-auth/react';
import styles from './RecentChanges.module.scss';

interface ChangeRecord {
    id: string;
    type: string;
    user?: string;
    userEmail?: string;
    userImage?: string;
    timestamp: string;
    spreadsheetId: string;
    range: string;
    rowIndex?: number;
    cellIndex?: number;
    value?: string;
    fieldName?: string;
    sheetName?: string;
}

const RecentChanges = () => {
    const { ws } = useWebSocket();
    const { data: session } = useSession();
    const [changes, setChanges] = useState<ChangeRecord[]>([]);
    const [, setIsAdmin] = useState(false);

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            setIsAdmin(true);
        }

        const storedChanges = localStorage.getItem('recentChanges');
        if (storedChanges) {
            try {
                setChanges(JSON.parse(storedChanges));
            } catch (e) {
                console.error("Erreur lors du chargement des modifications enregistrées:", e);
                localStorage.removeItem('recentChanges');
            }
        }
    }, [session]);

    useEffect(() => {
        if (ws) {
            const messageHandler = (event: MessageEvent) => {
                try {
                    const update = JSON.parse(event.data);

                    if (['UPDATE_CELL', 'INSERT_ROW', 'DELETE_ROW'].includes(update.type)) {

                        const newChange: ChangeRecord = {
                            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type: update.type,
                            user: session?.user?.name || update.user || 'Utilisateur inconnu',
                            userEmail: session?.user?.email || update.userEmail,
                            userImage: session?.user?.image || update.userImage,
                            timestamp: new Date().toISOString(),
                            spreadsheetId: update.spreadsheetId,
                            range: update.range,
                            rowIndex: update.rowIndex,
                            cellIndex: update.cellIndex,
                            value: update.value,
                            fieldName: update.fieldName,
                            sheetName: update.sheetName || getSheetName(update.range)
                        };

                        setChanges(prevChanges => {
                            const updatedChanges = [newChange, ...prevChanges].slice(0, 50);
                            localStorage.setItem('recentChanges', JSON.stringify(updatedChanges));

                            return updatedChanges;
                        });
                    }
                } catch (error) {
                    console.error("Erreur lors du traitement du message WebSocket:", error);
                }
            };

            ws.addEventListener('message', messageHandler);

            return () => {
                ws.removeEventListener('message', messageHandler);
            };
        }
    }, [ws, session]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionDescription = (change: ChangeRecord) => {
        switch (change.type) {
            case 'UPDATE_CELL':
                const cellRef = change.cellIndex !== undefined
                    ? `${String.fromCharCode(65 + change.cellIndex)}${(change.rowIndex || 0) + 1}`
                    : '';
                const fieldName = change.fieldName ? `"${change.fieldName}"` : 'cellule';

                return `Mise à jour de ${fieldName} ${cellRef} avec "${change.value}"`;
            case 'INSERT_ROW':
                return `Insertion d'une nouvelle ligne${change.rowIndex ? ` à la position ${change.rowIndex}` : ''}`;
            case 'DELETE_ROW':
                return `Suppression d'une ligne${change.rowIndex ? ` à la position ${change.rowIndex + 1}` : ''}`;
            default:
                return `Action inconnue: ${change.type}`;
        }
    };

    const getSheetName = (range: string = '') => {
        return range?.split('!')?.[0] || 'Feuille inconnue';
    };

    if (changes.length === 0) {
        return (
            <div className={styles.recentChanges}>
                <h2>Modifications récentes</h2>
                <p className={styles.emptyState}>Aucune modification récente. Les modifications apparaîtront ici lorsque vous modifierez le planning.</p>
            </div>
        );
    }

    return (
        <div className={styles.recentChanges}>
            <h2>Modifications récentes</h2>
            <div className={styles.tableWrapper}>
                <table className={styles.changesTable}>
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Utilisateur</th>
                        <th>Feuille</th>
                        <th className={styles.actionColumn}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {changes.map(change => (
                        <tr key={change.id}>
                            <td>{formatDate(change.timestamp)}</td>
                            <td className={styles.userCell}>
                                {change.userImage ? (
                                    <img
                                        src={change.userImage}
                                        alt={`${change.user}`}
                                        className={styles.userAvatar}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : null}
                                <span>{change.user}</span>
                            </td>
                            <td>{change.sheetName || getSheetName(change.range)}</td>
                            <td className={styles.actionColumn}>{getActionDescription(change)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.note}>
                <p>Note: Ces modifications sont enregistrées localement et seront réinitialisées si vous videz le cache du navigateur.</p>
            </div>
        </div>
    );
};

export default RecentChanges;