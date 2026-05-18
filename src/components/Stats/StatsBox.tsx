import { useDashboardContext } from "../../context/dashboardContext";
import { DashCard } from "./DashCard";
import {
    STAT_KEY_LABELS,
    SHOT_RATES_LABELS,
    CONTEST_LEVEL_LABELS,
    SHOT_TYPE_LABELS,
    COMPLEX_SHOT_TYPE_LABELS,
} from "../../utils/constants/statlabels";
import type { BasicShootingMetrics } from "../../types/shootingTypes";
import type {
    ShotRates,
    ContestLevel,
    ShotType,
    ComplexShotType,
} from "../../types/shotsTypes";

// Main component used to dynamically display team, player, and zone stats
// helper components below
type StatsBoxProps = {
    boxType: "team" | "player" | "zoneDetails";
};
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
        if (!teamStats)
            return (
                <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Team Shooting
                    </h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        No team stats found
                    </p>
                </div>
            );
        return (
            <div
                key="team"
                className=" flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
            >
                <div className="fadeIn flex flex-row justify-start gap-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Team Shooting
                    </h2>
                    <h3 className="flex flex-row items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Shot Frequency</span>{" "}
                        <div
                            className="inset-0 h-2 w-24 rounded-full"
                            style={{
                                background:
                                    "linear-gradient(to right, #5a2d81, #8b5cf6, #c4b5fd)",
                            }}
                        />
                    </h3>
                </div>

                <div className="fadeIn flex flex-row flex-wrap gap-2 items-start">
                    <OverviewSections stats={teamStats} />
                </div>
            </div>
        );
    }

    if (boxType === "player") {
        if (!selectedPlayerStats)
            return (
                <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Player Shooting
                    </h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        No player stats found
                    </p>
                </div>
            );
        return (
            <div
                key={selectedPlayerStats.player_id}
                className=" flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
            >
                <div className="fadeIn flex flex-row justify-start gap-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedPlayerStats.player_name}
                    </h2>
                    <h3 className="flex flex-row items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Shot Frequency</span>{" "}
                        <div
                            className="inset-0 h-2 w-24 rounded-full"
                            style={{
                                background:
                                    "linear-gradient(to right, #5a2d81, #8b5cf6, #c4b5fd)",
                            }}
                        />
                    </h3>
                </div>
                <div className="fadeIn flex flex-row flex-wrap gap-2 items-start">
                    <OverviewSections stats={selectedPlayerStats} />
                </div>
            </div>
        );
    }

    // zoneDetails: show zone stats when a cell is selected, otherwise player/team stats
    // shows complex shot type and dribble breakdowns
    const zoneStats = selectedCellKey
        ? activeStats
        : selectedPlayerId
          ? selectedPlayerStats
          : teamStats;

    const zoneTitle = selectedCellKey
        ? selectedPlayerId
            ? `${selectedPlayerStats?.player_name ?? "Player"} — Zone Shooting`
            : "Team — Zone Shooting"
        : selectedPlayerId
          ? `${selectedPlayerStats?.player_name ?? "Player"} — Detailed Shooting`
          : "Team — Detailed Shooting";

    // Show an empty zone when a cell is selected but it has no data for this player
    const isEmptyZone =
        selectedCellKey &&
        selectedPlayerId &&
        !selectedPlayerCourtMap?.[selectedCellKey];

    if (isEmptyZone) {
        return (
            <div className="flex flex-1 flex-col gap-2 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {zoneTitle}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    No shots in this zone
                </p>
            </div>
        );
    }

    if (!zoneStats)
        return (
            <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {zoneTitle}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    No stats found
                </p>
            </div>
        );

    return (
        <div
            key={`${selectedCellKey ?? "all"}-${selectedPlayerId ?? "team"}`}
            className=" flex flex-1 flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
        >
            <h2 className="fadeIn text-lg font-bold text-gray-900 dark:text-white">
                {zoneTitle}
            </h2>
            <div className="fadeIn flex flex-col flex-wrap gap-2 items-start">
                <ComplexSections stats={zoneStats} />
            </div>
        </div>
    );
}

// sub sections of the stats box used to group stats
function StatSection({
    title,
    children,
    cols,
}: {
    title: string | null;
    children: React.ReactNode;
    cols?: number;
}) {
    return (
        <div className="flex flex-col  gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-800">
            {title && (
                <h3 className="border-l-2 border-violet-500 pl-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {title}
                </h3>
            )}

            <div
                className={cols ? "grid gap-2" : "flex flex-wrap gap-2"}
                style={
                    cols
                        ? { gridTemplateColumns: `repeat(${cols}, 1fr)` }
                        : undefined
                }
            >
                {children}
            </div>
        </div>
    );
}

// Used to create primary type of Dashcard with hover effect showing extra stats
function ShotRatesCards({ label, rates }: { label: string; rates: ShotRates }) {
    if (rates.occurrence_rate === 0) return null;
    return (
        <DashCard
            title={label}
            values={[
                {
                    label: SHOT_RATES_LABELS.success_rate,
                    value: rates.success_rate,
                    isPercentage: true,
                },
                {
                    label: SHOT_RATES_LABELS.occurrence_rate,
                    value: rates.occurrence_rate,
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

//Graph Bars for dribbles before shot
function GraphBars({ label, rates }: { label: string; rates: ShotRates }) {
    return (
        <div className="relative flex flex-col items-center gap-1  h-[100px]  w-[20px]">
            <div className="absolute bottom-0 flex flex-col  items-center gap-1 h-full w-full">
                <div className="flex flex-col justify-end items-center gap-1 h-full w-full bg-gray-200 dark:bg-gray-700">
                    <div
                        className="bg-[#5a2d81] dark:bg-[#8b5cf6] w-full"
                        style={{ height: `${rates.success_rate * 100}%` }}
                    ></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {label}
                </span>
            </div>
        </div>
    );
}
// Dynamic section for player/team overview stats

function OverviewSections({ stats }: { stats: BasicShootingMetrics }) {
    return (
        <div className="flex flex-row gap-2 items-start">
            <StatSection title={null} cols={2}>
                <DashCard
                    title={STAT_KEY_LABELS.total_shots}
                    values={[
                        {
                            label: STAT_KEY_LABELS.total_shots,
                            value: stats.total_shots,
                        },
                    ]}
                    large={true}
                />
                <DashCard
                    title={STAT_KEY_LABELS.overall_shooting_average}
                    values={[
                        {
                            label: STAT_KEY_LABELS.overall_shooting_average,
                            value: stats.overall_shooting_average,
                            isPercentage: true,
                        },
                    ]}
                    large={true}
                />
                <DashCard
                    title={STAT_KEY_LABELS.overall_assist_rate}
                    values={[
                        {
                            label: STAT_KEY_LABELS.overall_assist_rate,
                            value: stats.overall_assist_rate,
                            isPercentage: true,
                        },
                    ]}
                />
                <DashCard
                    title={STAT_KEY_LABELS.overall_contested_rate}
                    values={[
                        {
                            label: STAT_KEY_LABELS.overall_contested_rate,
                            value: stats.overall_contested_rate,
                            isPercentage: true,
                        },
                    ]}
                />
                <DashCard
                    title={STAT_KEY_LABELS.overall_fouled_rate}
                    values={[
                        {
                            label: STAT_KEY_LABELS.overall_fouled_rate,
                            value: stats.overall_fouled_rate,
                            isPercentage: true,
                        },
                    ]}
                />
                <DashCard
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

            <div className="flex flex-row flex-wrap gap-2 items-start">
                <StatSection title="Shot Zones">
                    <ShotRatesCards label="2PT" rates={stats.two_point_rates} />
                    <ShotRatesCards
                        label="3PT"
                        rates={stats.three_point_rates}
                    />
                    <ShotRatesCards label="Paint" rates={stats.paint_rates} />
                </StatSection>

                <StatSection title="Situation">
                    <ShotRatesCards
                        label={STAT_KEY_LABELS.catch_and_shoot_rates}
                        rates={stats.catch_and_shoot_rates}
                    />
                    <ShotRatesCards
                        label={STAT_KEY_LABELS.late_shot_clock_rates}
                        rates={stats.late_shot_clock_rates}
                    />
                    <ShotRatesCards
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
                        <ShotRatesCards
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
                        <ShotRatesCards
                            key={type}
                            label={SHOT_TYPE_LABELS[type]}
                            rates={rates}
                        />
                    ))}
                </StatSection>
            </div>
        </div>
    );
}

function ComplexSections({ stats }: { stats: BasicShootingMetrics }) {
    const sortedShotTypeRates = Object.entries(
        stats.complex_shot_type_rates,
    ).sort((a, b) => b[1].success_rate - a[1].success_rate) as [
        ComplexShotType,
        ShotRates,
    ][];

    return (
        <>
            <StatSection title={STAT_KEY_LABELS.complex_shot_type}>
                {sortedShotTypeRates.map(([type, rates]) => (
                    <ShotRatesCards
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
                    <GraphBars key={count} label={count} rates={rates} />
                ))}
            </StatSection>
        </>
    );
}
