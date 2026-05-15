import { DashboardProvider } from "../context/DashboardProvider";
import { useDashboardContext } from "../context/dashboardContext";
import { Error } from "./UI/Error";
import { PlayerSelectBox } from "./PlayerSelectBox";
import { StatsBox } from "./StatsBox";
import { CourtBox } from "./CourtBox";

function DashboardContent() {
    const { shotsDataLoading, shotsDataError, selectedPlayerId } =
        useDashboardContext();

    return (
        <div className="flex h-full gap-4 p-4">
            {shotsDataLoading && (
                <p className="p-4 text-gray-500">Loading...</p>
            )}
            {shotsDataError && <Error error={shotsDataError} />}
            {!shotsDataLoading && !shotsDataError && (
                <>
                    {/* Left: sidebar stays fixed while right side scrolls */}
                    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto">
                        <PlayerSelectBox />
                    </aside>

                    {/* Right: stats stacked above court */}
                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                        {selectedPlayerId ? (
                            <StatsBox boxType="player" />
                        ) : (
                            <StatsBox boxType="team" />
                        )}
                        <CourtBox />
                    </div>
                </>
            )}
        </div>
    );
}

export function Dashboard() {
    return (
        <DashboardProvider>
            <DashboardContent />
        </DashboardProvider>
    );
}
