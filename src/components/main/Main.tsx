import Mois from "@/components/mois/Mois"
import Profil from "@/components/profil/Profil";

export interface MainProps {
    selectedMonth: string;
    selectedTab: string;
}

const Main = (props: MainProps) => {

    return (
        <>
            { props.selectedTab === 'Mois' && <Mois selectedMonth={props.selectedMonth}/>}
            { props.selectedTab === 'Profil' && <Profil />}
        </>
    );
}

export default Main;