import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';
import { useSession } from 'next-auth/react';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsertRow: () => void;
    onDeleteRow: () => void;
    rowData: {
        date: string;
        jour: string;
        selection: string;
        evenement: string;
        client: string;
        contact: string;
        observation: string;
    };
    onSave: (formData: {
        date: string;
        jour: string;
        selection: string;
        evenement: string;
        client: string;
        contact: string;
        observation: string;
    }) => void;
}

const EditModal: React.FC<EditModalProps> = ({isOpen, onClose, rowData, onInsertRow, onDeleteRow, onSave}) => {
    const { data: session } = useSession();
    const userRole = session?.user?.role;
    const isAdmin = userRole === 'admin';
    const isUser = userRole === 'user';

    const [formData, setFormData] = useState({
        date: '',
        jour: '',
        selection: '',
        evenement: '',
        client: '',
        contact: '',
        observation: ''
    });

    useEffect(() => {
        if (rowData) {
            setFormData({
                date: rowData.date,
                jour: rowData.jour,
                selection: rowData.selection,
                evenement: rowData.evenement,
                client: rowData.client,
                contact: rowData.contact,
                observation: rowData.observation
            });
        }
    }, [rowData]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (field: string) => (e: { target: { value: any; }; }) => {
        if (isUser && rowData[field as keyof typeof rowData] && String(rowData[field as keyof typeof rowData]).trim().length > 0) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleModalClick = (e: { stopPropagation: () => void; }) => {
        e.stopPropagation();
    };

    const handleInsertRow = () => {
        onInsertRow();
        onClose();
    };

    const handleDeleteRow = () => {
        onDeleteRow();
        onClose();
    };

    const isReadOnly = (field: string) => {
        return !!(isUser && rowData[field as keyof typeof rowData] && String(rowData[field as keyof typeof rowData]).trim().length > 0);

    };

    const modalContent = (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={handleModalClick}>
                <div className={styles.modalHeader}>
                    <h2>Modifier les données</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Date</label>
                            <input
                                value={formData.date}
                                onChange={handleChange('date')}
                                readOnly={isReadOnly('date')}
                                className={isReadOnly('date') ? styles.readOnly : ''}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Jour</label>
                            <input
                                value={formData.jour}
                                onChange={handleChange('jour')}
                                readOnly={isReadOnly('jour')}
                                className={isReadOnly('jour') ? styles.readOnly : ''}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Sélection</label>
                        <textarea
                            value={formData.selection}
                            onChange={handleChange('selection')}
                            readOnly={isReadOnly('selection')}
                            className={isReadOnly('selection') ? styles.readOnly : ''}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Évènement</label>
                        <textarea
                            value={formData.evenement}
                            onChange={handleChange('evenement')}
                            readOnly={isReadOnly('evenement')}
                            className={isReadOnly('evenement') ? styles.readOnly : ''}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Client</label>
                        <textarea
                            value={formData.client}
                            onChange={handleChange('client')}
                            readOnly={isReadOnly('client')}
                            className={isReadOnly('client') ? styles.readOnly : ''}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Contact</label>
                        <textarea
                            value={formData.contact}
                            onChange={handleChange('contact')}
                            readOnly={isReadOnly('contact')}
                            className={isReadOnly('contact') ? styles.readOnly : ''}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Observation</label>
                        <textarea
                            value={formData.observation}
                            onChange={handleChange('observation')}
                            readOnly={isReadOnly('observation')}
                            className={isReadOnly('observation') ? styles.readOnly : ''}
                        />
                    </div>

                    {isUser && (
                        <div className={styles.userMessage}>
                            <p className={styles.infoText}>
                                Vous pouvez seulement ajouter du contenu dans les champs vides.
                            </p>
                        </div>
                    )}

                    <div className={styles.modalFooter}>
                        <div>
                            {isAdmin && (
                                <button type="button" className={styles.deleteButton} onClick={handleDeleteRow}>
                                    Supprimer
                                </button>
                            )}
                            <button type="button" className={styles.insertButton} onClick={handleInsertRow}>
                                Ajouter
                            </button>
                        </div>
                        <div>
                            <button type="button" onClick={onClose} className={styles.cancelButton}>
                                Annuler
                            </button>
                            <button type="submit" className={styles.saveButton}>
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default EditModal;