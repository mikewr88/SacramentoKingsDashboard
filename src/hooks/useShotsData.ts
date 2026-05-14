import { useEffect, useState } from "react";
import Papa from "papaparse";
import shotsUrl from "../data/shots.csv?url";
import type { ShotRowType } from "../types/shotsTypes";

// Cached promise — parse runs once for the entire app session
let parsePromise: Promise<ShotRowType[]> | null = null;

function getShotsData(): Promise<ShotRowType[]> {
    if (!parsePromise) {
        parsePromise = new Promise((resolve, reject) => {
            Papa.parse<ShotRowType>(shotsUrl, {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: (results) => resolve(results.data),
                error: (err) => reject(new Error(err.message)),
            });
        });
    }
    return parsePromise;
}

export function useShotsData() {
    const [shotsData, setShotsData] = useState<ShotRowType[]>([]);
    const [shotsDataLoading, setShotsDataLoading] = useState(true);
    const [shotsDataError, setShotsDataError] = useState<string | null>(null);

    useEffect(() => {
        getShotsData()
            .then((data) => {
                setShotsData(data);
                setShotsDataLoading(false);
            })
            .catch((err: Error) => {
                setShotsDataError(err.message);
                setShotsDataLoading(false);
            });
    }, []);

    return { shotsData, shotsDataLoading, shotsDataError };
}
