import { Dashboard } from "./components/Dashboard";

function App() {
    return (
        <div className="flex h-screen flex-col dark:bg-gray-900">
            <nav className="shrink-0 border-b border-gray-200 px-6 py-3 dark:border-gray-700 text-white bg-purple-900 ">
                <h1 className="text-lg font-bold text-white">
                    Kings Analytics Dashboard
                </h1>
            </nav>
            <main className="flex-1 overflow-hidden">
                <Dashboard />
            </main>
        </div>
    );
}

export default App;
