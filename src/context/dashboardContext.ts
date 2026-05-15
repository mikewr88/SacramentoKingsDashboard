import { createContext, useContext } from "react";
import type { TeamType, CourtZone } from "../types/teamType";
import type { PlayerType } from "../types/playerType";

export type DashboardContextValue = {
    shotsDataLoading: boolean;
    shotsDataError: string | null;
    teamStats: TeamType | null;
    playerStats: Record<string, PlayerType> | null;
    teamCourtMap: Record<string, CourtZone> | null;
    playerCourtMaps: Record<string, Record<string, CourtZone>> | null;
    selectedPlayerId: string | null;
    setSelectedPlayerId: (id: string | null) => void;
    selectedPlayerStats: PlayerType | null;
    selectedPlayerCourtMap: Record<string, CourtZone> | null;
    selectedCellKey: string | null;
    setSelectedCellKey: (key: string | null) => void;
    // Derived: zone stats > player stats > team stats
    activeStats: TeamType | null;
};

export const DashboardContext = createContext<DashboardContextValue | null>(
    null,
);

// exported in a separate file to allow faster hot reloading and avoid warning
export function useDashboardContext() {
    const ctx = useContext(DashboardContext);
    if (!ctx) {
        throw new Error(
            "useDashboardContext must be used within DashboardProvider",
        );
    }
    return ctx;
}
