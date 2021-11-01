import { ActionCreatorWithPayload, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import gql from 'graphql-tag';
import { GqlClient } from '../../app/gql-client';
import { RootState } from '../../app/store';

/**
 * Typings
 */
export type Metrics = string[];

export interface VisualizationState {
  metrics: Metrics;
  dataPoints: DataPoint[];
  selectedMetrics: string[];
  subscription?: ZenObservable.Subscription;
  metricInfo: {
    [key: string]: {
      state: MetricState;
      unit?: string;
    };
  };
}

export enum MetricState {
  Added,
  Initializing,
  Initialized,
  Plotted,
  Removed,
}

export interface DataPoint {
  date: number;
  [metric: string]: number;
}

export interface GetMetricsResponse {
  getMetrics: Metrics;
}

export interface Measurement {
  metric: string;
  at: number;
  value: number;
  unit: string;
}

export type Measurements = { [metric: string]: Measurement[] };

export interface GetMeasurementsResponse {
  getMeasurements: Measurement[];
}

export interface NewMesurementResponse {
  newMeasurement: Measurement;
}

/**
 * Initial state of app
 */
const initialState: VisualizationState = {
  metrics: [],
  dataPoints: [],
  selectedMetrics: [],
  metricInfo: {},
};

let addMeasurementDataPoints: ActionCreatorWithPayload<Measurement[], string>;
let setSubscription: ActionCreatorWithPayload<ZenObservable.Subscription, string>;
let setMetricUnit: ActionCreatorWithPayload<{ metric: string; unit: string }, string>;
let setMetricState: ActionCreatorWithPayload<{ metric: string; newState: MetricState }, string>;

/**
 * Get metrics thunk action
 */
export const getMetricsAsync = createAsyncThunk<VisualizationState['metrics']>('visualization/getMetrics', async () => {
  const query = gql`
    query {
      getMetrics
    }
  `;

  const { data } = await GqlClient.query<GetMetricsResponse>({ query });
  return data.getMetrics;
});

export const getMeasurementsAsync = createAsyncThunk(
  'visualization/getMeasurements',
  async (metric: string, { dispatch }) => {
    dispatch(setMetricState({ metric, newState: MetricState.Initializing }));

    const query = gql`
      query ($metric: String!, $after: Timestamp) {
        getMeasurements(input: { metricName: $metric, after: $after }) {
          metric
          at
          value
          unit
        }
      }
    `;

    const variables = {
      metric,
      after: Date.now() - 30 * 60 * 1000,
    };

    const { data } = await GqlClient.query<GetMeasurementsResponse>({ query, variables });

    dispatch(setMetricUnit({ metric, unit: data.getMeasurements[0].unit }));
    dispatch(addMeasurementDataPoints(data.getMeasurements));
    dispatch(setMetricState({ metric, newState: MetricState.Initialized }));
  },
);

export const getNewMeasurementsAsync = createAsyncThunk(
  'visualization/getNewMeasurements',
  async (_, { dispatch, getState }) => {
    const query = gql`
      subscription {
        newMeasurement {
          metric
          at
          value
        }
      }
    `;

    const observable = GqlClient.subscribe<NewMesurementResponse>({ query });
    const subs = observable.subscribe((value) => {
      const measurement = value.data?.newMeasurement;
      if (measurement && (getState() as any).visualization.selectedMetrics.includes(measurement.metric)) {
        dispatch(addMeasurementDataPoints([measurement]));
      }
    });

    dispatch(setSubscription(subs));
  },
);

export const visualizationSlice = createSlice({
  name: 'visualization',
  initialState,
  reducers: {
    addSelectedMetric: (state, action: PayloadAction<string>) => {
      state.selectedMetrics.push(action.payload);
      state.metricInfo[action.payload] = { state: MetricState.Added };
    },
    removeSelectedMetric: (state, action: PayloadAction<string>) => {
      const idx = state.selectedMetrics.findIndex((metric) => metric === action.payload);
      state.selectedMetrics.splice(idx, 1);
      state.metricInfo[action.payload].state = MetricState.Removed;
    },
    addMeasurementDataPoints: (state, action: PayloadAction<Measurement[]>) => {
      action.payload.forEach((m) => {
        const idx = state.dataPoints.findIndex((dp) => dp.date === m.at);
        if (idx !== -1) {
          state.dataPoints[idx][m.metric] = m.value;
        } else {
          state.dataPoints.push({
            date: m.at,
            [m.metric]: m.value,
          });
        }
      });

      state.dataPoints.sort((a, b) => a.date - b.date);
    },
    setSubscription: (state, action: PayloadAction<ZenObservable.Subscription>) => {
      state.subscription = action.payload;
    },
    removeNewMeasurementsSubscription: (state) => {
      state.subscription?.unsubscribe();
    },
    setMetricState: (state, action: PayloadAction<{ metric: string; newState: MetricState }>) => {
      const { metric, newState } = action.payload;
      state.metricInfo[metric].state = newState;
    },
    setMetricUnit: (state, action: PayloadAction<{ metric: string; unit: string }>) => {
      state.metricInfo[action.payload.metric].unit = action.payload.unit;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getMetricsAsync.fulfilled, (state, action) => {
      if (state.metrics.length === 0) {
        state.metrics = action.payload;
      }
    });
  },
});

addMeasurementDataPoints = visualizationSlice.actions.addMeasurementDataPoints;
setSubscription = visualizationSlice.actions.setSubscription;
setMetricUnit = visualizationSlice.actions.setMetricUnit;
setMetricState = visualizationSlice.actions.setMetricState;

export const { addSelectedMetric, removeSelectedMetric, removeNewMeasurementsSubscription } =
  visualizationSlice.actions;

export const selectMetrics = (state: RootState) => state.visualization.metrics;
export const selectSelectedMetrics = (state: RootState) => state.visualization.selectedMetrics;
export const selectMetricsInfo = (state: RootState) => state.visualization.metricInfo;
export const selectDataPoints = (state: RootState) => state.visualization.dataPoints;

export const visualizationReducer = visualizationSlice.reducer;

export { setMetricUnit, setMetricState };
