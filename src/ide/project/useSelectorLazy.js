import { useContext } from 'react';
import { ReactReduxContext } from 'react-redux';

export const useSelectorLazy = (selector) => {
  const { store } = useContext(ReactReduxContext);
  return () => selector(store.getState());
};
