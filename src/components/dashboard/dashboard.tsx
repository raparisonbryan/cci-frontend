"use client"

import styles from "./dashboard.module.scss";
import planning_icon from "@/assets/planning_icon.svg";
import profil_icon from "@/assets/profil_icon.svg";
import mois_icon from "@/assets/mois_icon.svg";
import jour_icon from "@/assets/jour_icon.svg";
import Img from "@/components/image/Img";
import {useState} from "react";

const months = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

export interface DashboardProps {
    onMonthSelect: (month: string) => void;
    onTabSelect: (tab: string) => void;
}

const Dashboard = (props: DashboardProps) => {
    const [selectedTab, setSelectedTab] = useState('Mois');

    const handleTabSelect = (tab: string) => {
        setSelectedTab(tab);
        props.onTabSelect(tab);
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.title_wrapper}>
                <Img src={planning_icon} width={70} height={40} objectFit="contain" alt="icone planning" />
                <p>Planning<br/> CCI Ivato</p>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.tab}>
                <div className={styles.tab_wrapper} onClick={() => handleTabSelect('Profil')}>
                    <Img src={profil_icon} width={20} height={20} objectFit="cover" alt="icone profil" />
                    <p>Profil</p>
                </div>
                <div className={styles.tab_wrapper} onClick={() => handleTabSelect('Jour')}>
                    <Img src={jour_icon} width={20} height={20} objectFit="cover" alt="icone jour" />
                    <p>Vue jour</p>
                </div>
                <div className={styles.tab_wrapper} onClick={() => handleTabSelect('Mois')}>
                    <Img src={mois_icon} width={20} height={20} objectFit="cover" alt="icone mois" />
                    <p>Vue mois</p>
                </div>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.dates_wrapper}>
                {months.map((month) => (
                <div key={month} className={styles.tab_content} onClick={() => props.onMonthSelect(month)}>
                    <p>{month}</p>
                </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;