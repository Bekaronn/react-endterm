import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WifiOff, RefreshCw, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function Offline() {
  const { isOffline } = useNetworkStatus();
  const navigate = useNavigate();

  // Если соединение восстановилось, возвращаем пользователя на главную
  useEffect(() => {
    if (!isOffline) {
      navigate("/", { replace: true });
    }
  }, [isOffline, navigate]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="px-6 py-6 border-b border-border flex items-start gap-4">
          <div className="p-3 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-50">
            <WifiOff className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Офлайн-режим</p>
            <h1 className="text-2xl font-semibold text-card-foreground">Похоже, соединения с сетью нет</h1>
            <p className="text-muted-foreground">
              Вы можете продолжать работать с закешированными страницами. Как только интернет вернётся, данные обновятся автоматически.
            </p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg border border-dashed border-border/80">
              <div className="flex items-center gap-3 text-card-foreground">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Что доступно офлайн</h2>
              </div>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>• Ранее открытые страницы и данные, сохранённые сервис-воркером</li>
                <li>• Закладки и профиль, сохранённые локально</li>
                <li>• Переключение тем и языков</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-dashed border-border/80">
              <div className="flex items-center gap-3 text-card-foreground">
                <Download className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Что может быть недоступно</h2>
              </div>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>• Обновление списка вакансий и деталей</li>
                <li>• Вход/регистрация через интернет сервисы</li>
                <li>• Получение свежих рекомендаций</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border/70 bg-muted/30 text-sm text-muted-foreground">
            <p className="font-medium text-card-foreground mb-2">Как вернуться онлайн</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Проверьте Wi‑Fi или мобильный интернет</li>
              <li>Если нужно, переключитесь на другую сеть</li>
              <li>Нажмите «Переподключиться», когда соединение восстановится</li>
            </ol>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Как только интернет появится, мы автоматически подгрузим актуальные данные.
            </p>
            <Button size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Переподключиться
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

