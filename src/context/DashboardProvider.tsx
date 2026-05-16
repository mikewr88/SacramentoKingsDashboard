import { useMemo, useState, type ReactNode } from "react";
import { useShotsData } from "../hooks/useShotsData";
import {
    aggregateShots,
    buildPlayerStats,
    buildTeamCourtMap,
    buildPlayerCourtMaps,
} from "../utils/shotsAnalysis";
import {
    DashboardContext,
    type DashboardContextValue,
} from "./dashboardContext";

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { shotsData, shotsDataLoading, shotsDataError } = useShotsData();

    const ready = shotsData.length > 0;

    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(
        null,
    );
    const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);

    // Memoized data aggregation for team,players, and court maps
    const teamStats = useMemo(
        () => (ready ? aggregateShots(shotsData) : null),
        [shotsData, ready],
    );

    const playerStats = useMemo(
        () => (ready ? buildPlayerStats(shotsData) : null),
        [shotsData, ready],
    );

    const teamCourtMap = useMemo(
        () => (ready ? buildTeamCourtMap(shotsData) : null),
        [shotsData, ready],
    );

    const playerCourtMaps = useMemo(
        () => (ready ? buildPlayerCourtMaps(shotsData) : null),
        [shotsData, ready],
    );

    const selectedPlayerStats = useMemo(
        () =>
            selectedPlayerId ? (playerStats?.[selectedPlayerId] ?? null) : null,
        [selectedPlayerId, playerStats],
    );

    const selectedPlayerCourtMap = useMemo(
        () =>
            selectedPlayerId
                ? (playerCourtMaps?.[selectedPlayerId] ?? null)
                : null,
        [selectedPlayerId, playerCourtMaps],
    );

    // default to team stats when no player is selected, otherwise use selected player stats or zone stats
    const activeStats = useMemo(() => {
        if (selectedCellKey) {
            const map = selectedPlayerId
                ? selectedPlayerCourtMap
                : teamCourtMap;
            return map?.[selectedCellKey] ?? null;
        }
        return selectedPlayerId ? selectedPlayerStats : teamStats;
    }, [
        selectedCellKey,
        selectedPlayerId,
        selectedPlayerCourtMap,
        teamCourtMap,
        selectedPlayerStats,
        teamStats,
    ]);

    const value: DashboardContextValue = {
        shotsDataLoading,
        shotsDataError,
        teamStats,
        playerStats,
        teamCourtMap,
        playerCourtMaps,
        selectedPlayerId,
        setSelectedPlayerId,
        selectedPlayerStats,
        selectedPlayerCourtMap,
        selectedCellKey,
        setSelectedCellKey,
        activeStats,
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}
