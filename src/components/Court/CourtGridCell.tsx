import type { CourtZone } from "../../types/shootingTypes";
import { formatNumber } from "../../utils/mathUtils";

type CourtGridCellProps = {
    zone: CourtZone | undefined;
    maxShots: number;
    mode: "fgpercentage" | "plusminus";
    baseline: number;
    isSelected: boolean;
    onGridCellClick: () => void;
};

const MAX_DELTA = 0.2;

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

    let bgColor: string;
    if (mode === "fgpercentage") {
        //account for general distance of shot and reflect that on resulting hue
        // 3 zones. close, mid, far
        let shotRangeModifier = 0;
        if (Math.abs(zone.cell_x) >= 8 && Math.abs(zone.cell_y + 0.5) <= 1.5) {
            shotRangeModifier = 1;
        } else if (
            Math.abs(zone.cell_x) >= 6 &&
            Math.abs(zone.cell_y + 0.5) <= 2.5
        ) {
            shotRangeModifier = 1.15;
        } else if (
            Math.abs(zone.cell_x) >= 0 &&
            Math.abs(zone.cell_y + 0.5) <= 4.5
        ) {
            shotRangeModifier = 1.3;
        }

        const modifiedSuccessRate = successRate * shotRangeModifier;
        const hue = Math.min(
            Math.round(modifiedSuccessRate ** 2 * 120 * 2.5),
            120,
        );
        //using lightness to show volume and further emphasize high value zones
        const lightness = 40 + (1 - intensity * 2) * 20;

        bgColor = `hsla(${hue}, ${60}%, ${lightness}%, .8)`;
    } else {
        const delta = successRate - baseline;
        //max delta accomodates for large differences. Assumes 15% difference as max.
        const normalized = Math.max(-1, Math.min(1, delta / MAX_DELTA));
        const abs = Math.abs(normalized);
        const hue = normalized >= 0 ? 0 : 220;
        const saturation = Math.round(abs * 80);
        const lightness = Math.round(80 - abs * 45);
        bgColor = `hsla(${hue}, ${saturation}%, ${lightness}%, .8)`;
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
