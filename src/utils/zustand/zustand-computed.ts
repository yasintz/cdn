import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

const prefix = '$$_computed_';

function injectComputedMiddleware(f: StateCreator<any>): StateCreator<any> {
  return (set, get, api) => {
    const setWithComputed = (
      update: any | ((state: any) => any),
      replace?: boolean
    ) => {
      set((state: any) => {
        const updated = typeof update === 'object' ? update : update(state);

        const computedSt = state[prefix]?.(updated);

        return {
          ...state,
          ...updated,
          ...computedSt,
        };
      }, replace);
    };

    api.setState = setWithComputed;
    const st = f(setWithComputed, get, api);
    const computedSt = st[prefix]?.(st);

    return Object.assign({}, st, computedSt);
  };
}

export function computedCreator<StoreType>() {
  function computed<T extends Partial<StoreType>>(
    fn: (store: StoreType) => T
  ): T {
    return {
      [prefix]: fn,
    } as any;
  }

  return computed;
}
export const computed = <StoreType>() => {
  function computed<T extends Partial<StoreType>>(
    fn: (store: StoreType) => T
  ): T {
    return {
      [prefix]: fn,
    } as any;
  }

  return computed;
};

export function computedMiddleware<S>(fn: S): S {
  return injectComputedMiddleware(fn as any) as any;
}
