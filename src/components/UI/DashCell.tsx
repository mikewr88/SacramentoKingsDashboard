import { formatNumber } from "../../utils/mathUtils";

export type StatValue = {
    label: string;
    value: number;
    isPercentage?: boolean;
};

type DashCellProps = {
    title: string;
    values: StatValue[];
};

export function DashCell({ title, values }: DashCellProps) {
    const [primary, ...secondary] = values;

    // secondary[0] drives the frequency bar (usage/occurrence rate)
    const usageRate = Math.max(secondary[0]?.value ?? 0, 0.05);

    // secondary[1+] are the stats revealed on hover
    const expandableStats = secondary.slice(1);

    return (
        <div className="group relative flex w-36 flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900 hover:border-violet-500 cursor-default ">
            {/* Expandable stats shown on hover*/}
            {expandableStats.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 z-10 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100">
                    <div className="flex flex-col gap-1 w-7/8 mx-auto rounded-t-lg border border-b-0 border-gray-200 bg-white dark:bg-gray-900 px-3 pb-2 pt-2 dark:border-gray-700 dark:bg-gray-800">
                        {expandableStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="flex justify-between text-xs text-gray-500 dark:text-gray-400"
                            >
                                <span>{stat.label}</span>
                                <span className="font-medium">
                                    {formatNumber(
                                        stat.value,
                                        stat.isPercentage ?? false,
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <span className="text-center text-xs leading-tight text-gray-500 dark:text-gray-400">
                {title}
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatNumber(primary.value, primary.isPercentage)}
            </span>

            {/* Frequency bar: full gradient clipped from the right based on usage rate */}
            {secondary.length >= 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-2 overflow-hidden rounded-b-lg">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(to right, #4C1D95, #8B5CF6, #C4B5FD)",
                            clipPath: `inset(0 ${(1 - usageRate) * 100}% 0 0)`,
                        }}
                    />
                </div>
            )}
        </div>
    );
}
