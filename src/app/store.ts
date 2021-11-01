import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { visualizationReducer } from '../Features/Visualization/visualizationSlice';

export const store = configureStore({
  reducer: {
    visualization: visualizationReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
