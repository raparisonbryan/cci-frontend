'use client'

import Dashboard from "@/components/dashboard/dashboard";
import styles from "./page.module.scss";
import Main from "@/components/main/Main";
import { useState } from 'react';

export default function Home() {
    const [selectedMonth, setSelectedMonth] = useState('Janvier');
    const [selectedTab, setSelectedTab] = useState('Mois');

    const handleMonthSelect = (month: string) => {
      setSelectedMonth(month);
    };

    const handleTabSelect = (tab: string) => {
        setSelectedTab(tab);
    };

  return (
    <main className={styles.main}>
      <Dashboard onMonthSelect={handleMonthSelect} onTabSelect={handleTabSelect} />
      <Main selectedMonth={selectedMonth} selectedTab={selectedTab}/>
    </main>
  );
}
