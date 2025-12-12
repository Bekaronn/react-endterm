import { WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export default function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <Alert className="border-amber-200 bg-transparent text-amber-900 dark:text-amber-50 dark:border-amber-800">
          <WifiOff className="h-5 w-5" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <AlertTitle className="text-amber-900 dark:text-amber-50">Вы офлайн</AlertTitle>
              <AlertDescription className="text-amber-900/90 dark:text-amber-100/80">
                Соединения с сетью нет. Мы покажем закешированные данные, а новые результаты появятся после подключения.
              </AlertDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-900 dark:border-amber-700 dark:text-amber-50">
              <Link to="/offline">Открыть офлайн-страницу</Link>
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  );
}

