import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsertRow: () => void;
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

const EditModal: React.FC<EditModalProps> = ({
    isOpen,
    onClose,
    rowData,
    onInsertRow,
    onSave
}) => {
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

    const modalContent = (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={handleModalClick}>
                <div className={styles.modalHeader}>
                    <h2>Modifier les données</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>Sélection</label>
                        <textarea
                            value={formData.selection}
                            onChange={handleChange('selection')}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Évènement</label>
                        <textarea
                            value={formData.evenement}
                            onChange={handleChange('evenement')}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Client</label>
                        <textarea
                            value={formData.client}
                            onChange={handleChange('client')}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Contact</label>
                        <textarea
                            value={formData.contact}
                            onChange={handleChange('contact')}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Observation</label>
                        <textarea
                            value={formData.observation}
                            onChange={handleChange('observation')}
                        />
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleInsertRow}
                            className={styles.insertButton}
                        >
                            Ajouter un évènement
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default EditModal;