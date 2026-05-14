import { useEffect } from "react";
import { useShotsData } from "../hooks/useShotsData";
import { aggregateShots } from "../utils/shotsAnalysis";
export function Dashboard() {
    const { shotsData, shotsDataLoading, shotsDataError } = useShotsData();

    useEffect(() => {
        if (shotsData) {
            const teamStats = aggregateShots(shotsData);
            console.log(teamStats);
        }
    }, [shotsData]);

    return (
        <>
            <div>
                <h1>Dashboard</h1>
                {shotsDataLoading && <p>Loading...</p>}
                {shotsDataError && <p>Error: {shotsDataError}</p>}
                {!shotsDataLoading && !shotsDataError && (
                    <p>{shotsData.length} shots loaded</p>
                )}
            </div>
        </>
    );
}
