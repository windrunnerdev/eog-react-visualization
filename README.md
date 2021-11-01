## Create React App Visualization

# Work have done
Visualization feature is done in this task by implementing 3 react components and one redux store slice in feature
directory.

## State
App visualization state consists of 5 props:
1. `metrics` to store metrics fetched from API.
2. `metricInfo` to store unit and state of each metric.
3. `selectedMetrics` to store metrics selected by user.
4. `dataPoints` to store measurements for all the metrics in an array.
5. `subscription` to store a reference of newMeasurement subscription.

Store has actions and reducers to manipulate this state.

## React Components
### Metrics
This component dispatches action for fetching metrics from graphql API when mounted and 
renders an AutoComplete component to allow user select desired metrics to show on chart. It updates selectedMetrics whenever user changes selection.



### Chart
This component is responsilble for rendering and updating chart. It creates amcharts instance when mounted on the page. Whenever user changes metrics selection, actions for getting measurements, adding chart series for metric, adding data to chart and removing series for unselected metrics is done by this component.

## How chart gets new updates
As soon as user selects first metric to be shown on the chart, thunk action for starting `newMeasurement` subscription is dispatched. Thanks to wsLink, thunk action gets new measurements via websocket connection and adds then to the `dataPoints` state. `Chart` component checks `dataPoints` updates in a `useEffect` hook and compares data to existing data on the chart, if there are some new data points, adds them to the chart.
