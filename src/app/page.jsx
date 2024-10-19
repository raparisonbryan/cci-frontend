'use client'

import Dashboard from "@/components/dashboard/dashboard";
import styles from "./page.module.scss";
import Main from "@/components/main/main";
import { useState } from 'react';

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState('Janvier');

  const handleMonthSelect = (month) => {
      setSelectedMonth(month);
  };

  return (
    <main className={styles.main}>
      <Dashboard onMonthSelect={handleMonthSelect} />
      <Main selectedMonth={selectedMonth} />
    </main>
  );
}
