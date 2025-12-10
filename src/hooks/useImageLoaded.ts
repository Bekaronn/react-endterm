import { useState, useEffect } from 'react';

// Описываем тип возвращаемого значения (не обязательно, но полезно для подсказок)
interface UseImageLoadedState {
  isLoaded: boolean;
  hasError: boolean;
}

export const useImageLoaded = (src: string | undefined | null): UseImageLoadedState => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // Сбрасываем состояния при изменении src
    setIsLoaded(false);
    setHasError(false);

    // Если src не передан или пустой, ничего не делаем
    if (!src) return;

    const img = new Image();
    img.src = src;

    // const onLoad = () => setIsLoaded(true);
    const onLoad = () => {
        setTimeout(() => {
          setIsLoaded(true);
        }, 2000); // Ждем 2 секунды
      };
    const onError = () => setHasError(true);

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);

    // Функция очистки (cleanup)
    return () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
  }, [src]);

  return { isLoaded, hasError };
};