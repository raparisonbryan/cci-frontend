"use client"

import styles from "./dashboard.module.scss";
import planning_icon from "@/assets/planning_icon.svg";
import profil_icon from "@/assets/profil_icon.svg";
import logo from "@/assets/cci_logo_white.png";
import Img from "@/components/image/Img";
import {useEffect, useState} from "react";
import {Button, Drawer} from "antd";
import {MenuOutlined} from "@ant-design/icons";

const months = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

export interface DashboardProps {
    onMonthSelect: (month: string) => void;
    onTabSelect: (tab: string) => void;
}

const Dashboard = (props: DashboardProps) => {
    const [open, setOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [, setSelectedTab] = useState('Mois');

    const handleTabSelect = (tab: string) => {
        setSelectedTab(tab);
        props.onTabSelect(tab);
    }

    useEffect(() => {
        const checkIfDesktop = () => {
            setIsDesktop(window.innerWidth <= 1200);
        };

        checkIfDesktop();
        window.addEventListener('resize', checkIfDesktop);
        return () => window.removeEventListener('resize', checkIfDesktop);
    }, []);

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const DashboardContent = () => (
        <>
            <div className={styles.title_wrapper}>
                <p>Planning<br/> CCI Ivato</p>
                <Img src={logo} width={100} height={50} objectFit="contain" alt="icone planning" />
            </div>
            <div className={styles.separator}></div>
            <div className={styles.tab}>
                <div className={styles.tab_wrapper} onClick={() => handleTabSelect('Profil')}>
                    <Img src={profil_icon} width={20} height={20} objectFit="cover" alt="icone profil" />
                    <p>Profil</p>
                </div>
                <div className={styles.tab_wrapper} onClick={() => handleTabSelect('Mois')}>
                    <Img src={planning_icon} width={20} height={20} objectFit="cover" alt="icone mois" />
                    <p>Vue mois</p>
                </div>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.dates_wrapper}>
                {months.map((month) => (
                    <div
                        key={month}
                        className={styles.tab_content}
                        onClick={() => {
                            props.onMonthSelect(month);
                            if (isDesktop) {
                                onClose();
                            }
                        }}
                    >
                        <p>{month}</p>
                    </div>
                ))}
            </div>
        </>
    );

    if (!isDesktop) {
        return (
            <div className={styles.dashboard}>
                <DashboardContent />
            </div>
        );
    }

    return (
        <>
            <Button
                type="primary"
                onClick={showDrawer}
                icon={<MenuOutlined />}
                style={{ position: 'fixed', right: 20, top: 20, zIndex: 999, background: '#18534F' }}
            >
                Menu
            </Button>
            <Drawer
                style={{backgroundColor: '#18534F', color: 'white'}}
                title="Planning 2025"
                placement="left"
                closable={true}
                onClose={onClose}
                open={open}
                width={300}
            >
                <div className={styles.dashboard_mobile}>
                    <DashboardContent />
                </div>
            </Drawer>
        </>

    );
}

export default Dashboard;