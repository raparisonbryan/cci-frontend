import styles from "./dashboard.module.scss";
import planning_icon from "@/assets/planning_icon.svg";
import profil_icon from "@/assets/profil_icon.svg";
import mois_icon from "@/assets/mois_icon.svg";
import jour_icon from "@/assets/jour_icon.svg";
import Img from "@/components/image/Img";

const months = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
  ];

export default function Dashboard({ onMonthSelect }) {
    return (
        <div className={styles.dashboard}>
            <div className={styles.title_wrapper}>
                <Img src={planning_icon} width={70} height={40} objectFit="contain" />
                <p>Planning<br/> CCI Ivato</p>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.tab}>
                <div className={styles.tab_wrapper}>
                    <Img src={profil_icon} width={20} height={20} objectFit="cover" />
                    <p>Profil</p>
                </div>
                <div className={styles.tab_wrapper}>
                    <Img src={jour_icon} width={20} height={20} objectFit="cover" />
                    <p>Vue jour</p>
                </div>
                <div className={styles.tab_wrapper}>
                    <Img src={mois_icon} width={20} height={20} objectFit="cover" />
                    <p>Vue mois</p>
                </div>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.dates_wrapper}>
                {months.map((month) => (
                <div key={month} className={styles.tab_content} onClick={() => onMonthSelect(month)}>
                    <p>{month}</p>
                </div>
                ))}
            </div>
        </div>
    );
}