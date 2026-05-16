import type { CourtZone } from "../../types/teamType";
import { formatNumber } from "../../utils/mathUtils";

type CourtGridCellProps = {
    zone: CourtZone | undefined;
    maxShots: number;
    mode: "fgpercentage" | "plusminus";
    baseline: number;
    isSelected: boolean;
    onGridCellClick: () => void;
};

const MAX_DELTA = 0.15;

export function CourtGridCell({
    zone,
    maxShots,
    mode,
    baseline,
    isSelected,
    onGridCellClick,
}: CourtGridCellProps) {
    if (!zone || zone.total_shots === 0) {
        return <div className="h-full w-full rounded-sm opacity-0" />;
    }

    const intensity = zone.total_shots / maxShots;
    const successRate = zone.overall_shooting_average;

    const alpha = 0.3 + intensity * 0.7;
    let bgColor: string;

    if (mode === "fgpercentage") {
        const saturation = Math.round(successRate ** 2 * 100 * 4);
        const lightness = 35 + (1 - intensity) * 25;
        bgColor = `hsla(271, ${saturation}%, ${lightness}%, ${alpha})`;
    } else {
        const delta = successRate - baseline;
        //max delta accomodates for large differences. Assumes 15% difference as max.
        const normalized = Math.max(-1, Math.min(1, delta / MAX_DELTA));
        const abs = Math.abs(normalized);
        const hue = normalized >= 0 ? 0 : 220;
        const saturation = Math.round(abs * 80);
        const lightness = Math.round(80 - abs * 45);
        bgColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    }

    const deltaLabel =
        mode === "plusminus"
            ? `${successRate - baseline >= 0 ? "+" : ""}${formatNumber(successRate - baseline, true)}`
            : null;

    return (
        <div
            className={`group relative h-full w-full cursor-pointer rounded-sm  ${
                isSelected
                    ? "outline outline-2 outline-black-500"
                    : "hover:outline hover:outline-1 hover:outline-black/60"
            }`}
            style={{ backgroundColor: bgColor }}
            onClick={onGridCellClick}
        >
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow group-hover:block">
                <div>{formatNumber(zone.total_shots)} shots</div>
                <div>FG: {formatNumber(successRate, true)}</div>
                {deltaLabel && <div>vs Team: {deltaLabel}</div>}
            </div>
        </div>
    );
}
