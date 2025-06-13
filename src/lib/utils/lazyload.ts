// src/lib/utils/lazyLoad.ts
export function lazyComponent<T extends object>(
  loader: () => Promise<{ default: T }>
): T {
  let Component: T | undefined;
  let loading = false;
  let error: Error | undefined;
  
  const loadComponent = async () => {
    if (!loading && !Component && !error) {
      loading = true;
      try {
        const module = await loader();
        Component = module.default;
      } catch (e) {
        error = e as Error;
        console.error('Failed to load component:', e);
      } finally {
        loading = false;
      }
    }
  };
  
  return new Proxy({} as T, {
    get(target, prop) {
      if (!Component && !loading && !error) {
        loadComponent();
      }
      
      if (Component) {
        return Component[prop as keyof T];
      }
      
      // Return a loading component or placeholder
      if (prop === 'render' || prop === 'default') {
        return () => null;
      }
      
      return undefined;
    }
  });
}