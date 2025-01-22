import Mois from "@/components/tabs/mois/Mois";
import Jour from "@/components/tabs/jour/Jour";

export interface MainProps {
    selectedMonth: string;
    selectedDay: number;
    selectedTab: string;
}

const Main = (props: MainProps) => {

    return (
        <>
            { props.selectedTab === 'Mois' && <Mois selectedMonth={props.selectedMonth}/>}
            { props.selectedTab === 'Jour' && <Jour selectedDay={props.selectedDay}/>}
            { props.selectedTab === 'Profil' && <Mois selectedMonth={props.selectedMonth}/>}
        </>
    );
}

export default Main;