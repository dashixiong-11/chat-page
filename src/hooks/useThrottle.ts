import { useCallback, useEffect, useRef } from 'react';

export function useThrottle<T extends (...ags: any[]) => void>(fn: T, delay: number, dep = []) {
  const { current } = useRef<{ fn: T, timer: number | null }>({ fn, timer: null });
  useEffect(function () {
    current.fn = fn;
  }, [fn]);

  return useCallback(function f(this:any,...args:Parameters<T>) {
    if (current.timer) {
      clearTimeout(current.timer);
    }
    current.timer = setTimeout(() => {
      current.fn.call(this, ...args);
    }, delay);
  }, dep) as unknown as number
}
