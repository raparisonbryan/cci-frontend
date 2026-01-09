import Mois from "@/components/mois/Mois"
import Profil from "@/components/profil/Profil";
import Mois26 from "@/components/mois/Mois26";
import Mois27 from "@/components/mois/Mois27";

export interface MainProps {
    selectedMonth: string;
    selectedTab: string;
}

const Main = (props: MainProps) => {

    return (
        <>
            { props.selectedTab === 'Mois' && <Mois selectedMonth={props.selectedMonth}/>}
            { props.selectedTab === 'Mois26' && <Mois26 selectedMonth={props.selectedMonth}/>}
            { props.selectedTab === 'Mois27' && <Mois27 selectedMonth={props.selectedMonth}/>}
            { props.selectedTab === 'Profil' && <Profil />}
        </>
    );
}

export default Main;