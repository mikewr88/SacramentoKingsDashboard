import { useDashboardContext } from "../context/dashboardContext";
import { DashCell } from "./UI/DashCell";
import {
    STAT_KEY_LABELS,
    SHOT_RATES_LABELS,
    CONTEST_LEVEL_LABELS,
    SHOT_TYPE_LABELS,
    COMPLEX_SHOT_TYPE_LABELS,
} from "../utils/statlabels";
import type { TeamType } from "../types/teamType";
import type {
    ShotRates,
    ContestLevel,
    ShotType,
    ComplexShotType,
} from "../types/shotsTypes";

type StatsBoxProps = {
    boxType: "team" | "player" | "playerLocation";
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function StatSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {title}
            </h3>
            <div className="flex  flex-wrap gap-3">{children}</div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ShotRatesCells({ label, rates }: { label: string; rates: ShotRates }) {
    return (
        <DashCell
            title={label}
            values={[
                {
                    label: SHOT_RATES_LABELS.success_rate,
                    value: rates.success_rate,
                    isPercentage: true,
                },
                {
                    label: SHOT_RATES_LABELS.usage_rate,
                    value: rates.usage_rate,
                    isPercentage: true,
                },
                {
                    label: SHOT_RATES_LABELS.assisted_rate,
                    value: rates.assisted_rate,
                    isPercentage: true,
                },
                {
                    label: SHOT_RATES_LABELS.fouled_rate,
                    value: rates.fouled_rate,
                    isPercentage: true,
                },
                {
                    label: SHOT_RATES_LABELS.blocked_rate,
                    value: rates.blocked_rate,
                    isPercentage: true,
                },
            ]}
        />
    );
}

// Dynamic section for player/team overview stats

function OverviewSections({ stats }: { stats: TeamType }) {
    return (
        <>
            <StatSection title="Overview">
                <DashCell
                    title={STAT_KEY_LABELS.total_shots}
                    values={[
                        {
                            label: STAT_KEY_LABELS.total_shots,
                            value: stats.total_shots,
                        },
                    ]}
                />
                <DashCell
                    title={STAT_KEY_LABELS.overall_shooting_average}
                    values={[
                        {
                            label: STAT_KEY_LABELS.overall_shooting_average,
                            value: stats.overall_shooting_average,
                            isPercentage: true,
                        },
                    ]}
                />
                <DashCell
                    title={STAT_KEY_LABELS.overall_assist_rate}
                    values={[
                        {
                            label: STAT_KEY_LABELS.overall_assist_rate,
                            value: stats.overall_assist_rate,
                            isPercentage: true,
                        },
                    ]}
                />
                <DashCell
                    title={STAT_KEY_LABELS.overall_contested_rate}
                    values={[
                        {
                            label: STAT_KEY_LABELS.overall_contested_rate,
                            value: stats.overall_contested_rate,
                            isPercentage: true,
                        },
                    ]}
                />
                <DashCell
                    title={STAT_KEY_LABELS.overall_fouled_rate}
                    values={[
                        {
                            label: STAT_KEY_LABELS.overall_fouled_rate,
                            value: stats.overall_fouled_rate,
                            isPercentage: true,
                        },
                    ]}
                />
                <DashCell
                    title={STAT_KEY_LABELS.overall_blocked_rate}
                    values={[
                        {
                            label: STAT_KEY_LABELS.overall_blocked_rate,
                            value: stats.overall_blocked_rate,
                            isPercentage: true,
                        },
                    ]}
                />
            </StatSection>

            <StatSection title="Shot Zones">
                <ShotRatesCells label="2PT" rates={stats.two_point_rates} />
                <ShotRatesCells label="3PT" rates={stats.three_point_rates} />
                <ShotRatesCells label="Paint" rates={stats.paint_rates} />
            </StatSection>

            <StatSection title="Situation">
                <ShotRatesCells
                    label={STAT_KEY_LABELS.catch_and_shoot_rates}
                    rates={stats.catch_and_shoot_rates}
                />
                <ShotRatesCells
                    label={STAT_KEY_LABELS.late_shot_clock_rates}
                    rates={stats.late_shot_clock_rates}
                />
                <ShotRatesCells
                    label={STAT_KEY_LABELS.late_game_clock_rates}
                    rates={stats.late_game_clock_rates}
                />
            </StatSection>

            <StatSection title="Contest Level">
                {(
                    Object.entries(stats.contest_level_rates) as [
                        ContestLevel,
                        ShotRates,
                    ][]
                ).map(([level, rates]) => (
                    <ShotRatesCells
                        key={level}
                        label={CONTEST_LEVEL_LABELS[level]}
                        rates={rates}
                    />
                ))}
            </StatSection>

            <StatSection title="Shot Type">
                {(
                    Object.entries(stats.shot_type_rates) as [
                        ShotType,
                        ShotRates,
                    ][]
                ).map(([type, rates]) => (
                    <ShotRatesCells
                        key={type}
                        label={SHOT_TYPE_LABELS[type]}
                        rates={rates}
                    />
                ))}
            </StatSection>
        </>
    );
}

function ComplexSections({ stats }: { stats: TeamType }) {
    return (
        <>
            <StatSection title={STAT_KEY_LABELS.complex_shot_type}>
                {(
                    Object.entries(stats.complex_shot_type_rates) as [
                        ComplexShotType,
                        ShotRates,
                    ][]
                ).map(([type, rates]) => (
                    <ShotRatesCells
                        key={type}
                        label={COMPLEX_SHOT_TYPE_LABELS[type]}
                        rates={rates}
                    />
                ))}
            </StatSection>

            <StatSection title={STAT_KEY_LABELS.dribbles_before}>
                {(
                    Object.entries(stats.dribbles_before_rates) as [
                        string,
                        ShotRates,
                    ][]
                ).map(([count, rates]) => (
                    <ShotRatesCells
                        key={count}
                        label={`${count} dribble${count === "1" ? "" : "s"}`}
                        rates={rates}
                    />
                ))}
            </StatSection>
        </>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StatsBox({ boxType }: StatsBoxProps) {
    const {
        teamStats,
        selectedPlayerStats,
        selectedPlayerCourtMap,
        activeStats,
        selectedCellKey,
        selectedPlayerId,
    } = useDashboardContext();

    if (boxType === "team") {
        if (!teamStats) return null;
        return (
            <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Team Stats
                </h2>
                <div className="flex flex-row flex-wrap gap-4 items-start">
                    <OverviewSections stats={teamStats} />
                </div>
            </div>
        );
    }

    if (boxType === "player") {
        //below is left over from previous version. Leaving here on purpose
        if (!selectedPlayerStats) {
            return (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-gray-400 dark:border-gray-600 dark:text-gray-500">
                    Select a player to view stats
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedPlayerStats.player_name}
                </h2>
                <div className="flex flex-row flex-wrap gap-4 items-start">
                    <OverviewSections stats={selectedPlayerStats} />
                </div>
            </div>
        );
    }

    // playerLocation: zone stats when a cell is selected, otherwise player/team stats
    // shows complex shot type and dribble breakdowns
    const locationStats = selectedCellKey
        ? activeStats
        : selectedPlayerId
          ? selectedPlayerStats
          : teamStats;

    const locationTitle = selectedCellKey
        ? selectedPlayerId
            ? `${selectedPlayerStats?.player_name ?? "Player"} — Zone Stats`
            : "Team — Zone Stats"
        : selectedPlayerId
          ? `${selectedPlayerStats?.player_name ?? "Player"} — Detailed Stats`
          : "Team — Detailed Stats";

    // Show an empty zone when a cell is selected but it has no data for this player
    const isEmptyZone =
        selectedCellKey &&
        selectedPlayerId &&
        !selectedPlayerCourtMap?.[selectedCellKey];

    if (isEmptyZone) {
        return (
            <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {locationTitle}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    No shots in this zone
                </p>
            </div>
        );
    }

    if (!locationStats) return null;

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {locationTitle}
            </h2>
            <div className="flex flex-row flex-wrap gap-4 items-start">
                <ComplexSections stats={locationStats} />
            </div>
        </div>
    );
}
