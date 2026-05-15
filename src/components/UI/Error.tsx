import { useEffect, useState } from "react";

export function Error({ error }: { error: string }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 5000);
        return () => clearTimeout(timer);
    }, [error]);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 flex items-start gap-3 rounded-lg bg-red-600 px-4 py-3 text-white shadow-lg">
            <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="ml-2 text-white/70 hover:text-white"
                aria-label="Dismiss"
            >
                ✕
            </button>
        </div>
    );
}
