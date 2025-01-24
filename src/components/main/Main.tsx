import Mois from "@/components/mois/Mois"

export interface MainProps {
    selectedMonth: string;
    selectedTab: string;
}

const Main = (props: MainProps) => {

    return (
        <>
            { props.selectedTab === 'Mois' && <Mois selectedMonth={props.selectedMonth}/>}
            { props.selectedTab === 'Profil' && <Mois selectedMonth={props.selectedMonth}/>}
        </>
    );
}

export default Main;