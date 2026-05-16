import { createContext, useContext } from "react";
import type { BasicShootingMetrics, CourtZone } from "../types/shootingTypes";
import type { PlayerShootingMetrics } from "../types/playerShootingType";

export type DashboardContextValue = {
    shotsDataLoading: boolean;
    shotsDataError: string | null;
    teamStats: BasicShootingMetrics | null;
    playerStats: Record<string, PlayerShootingMetrics> | null;
    teamCourtMap: Record<string, CourtZone> | null;
    playerCourtMaps: Record<string, Record<string, CourtZone>> | null;
    selectedPlayerId: string | null;
    setSelectedPlayerId: (id: string | null) => void;
    selectedPlayerStats: PlayerShootingMetrics | null;
    selectedPlayerCourtMap: Record<string, CourtZone> | null;
    selectedCellKey: string | null;
    setSelectedCellKey: (key: string | null) => void;
    activeStats: BasicShootingMetrics | null;
};

export const DashboardContext = createContext<DashboardContextValue | null>(
    null,
);

// Context was exported in a separate file from provider to allow faster hot reloading and avoid warning
export function useDashboardContext() {
    const ctx = useContext(DashboardContext);
    if (!ctx) {
        throw new Error(
            "useDashboardContext must be used within DashboardProvider",
        );
    }
    return ctx;
}
