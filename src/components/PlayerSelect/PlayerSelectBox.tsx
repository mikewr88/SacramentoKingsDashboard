import { PlayersActive } from "./PlayersActive";
import { PlayersList } from "./PlayersList";

export function PlayerSelectBox() {
    return (
        <div className="flex flex-col gap-4">
            <PlayersActive />
            <PlayersList />
        </div>
    );
}
