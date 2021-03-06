import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { makeStyles } from '@mui/styles';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../app/hooks';
import {
  getMeasurementsAsync,
  getNewMeasurementsAsync,
  MetricState,
  removeNewMeasurementsSubscription,
  selectDataPoints,
  selectMetricsInfo,
  selectSelectedMetrics,
  setMetricState,
} from './visualizationSlice';

am4core.useTheme(am4themes_animated);

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '500px',
    padding: '0 20px',
  },
});

export const Chart: FC = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const [chart, setChart] = useState<am4charts.XYChart>();
  const selectedMetrics = useAppSelector(selectSelectedMetrics);
  const metricsInfo = useAppSelector(selectMetricsInfo);
  const dataPoints = useAppSelector(selectDataPoints);

  useEffect(() => {
    // create empty amcharts on component creation
    const chartx = am4core.create('chart', am4charts.XYChart);

    chartx.paddingRight = 20;
    chartx.data = [];

    // create chart x axis as date axis
    const dateAxis = chartx.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;

    // add chart legend
    chartx.legend = new am4charts.Legend();

    // add chart cursor to see values
    chartx.cursor = new am4charts.XYCursor();

    setChart(chartx);

    return () => {
      // cleanup chart and subscription on component unmount
      if (chart) {
        chart.dispose();
      }

      dispatch(removeNewMeasurementsSubscription());
    };
  }, []);

  useEffect(() => {
    Object.keys(metricsInfo).forEach((metric) => {
      const info = metricsInfo[metric];

      if (info.state === MetricState.Added) {
        // dispatch action to get measurements for newly added metric
        dispatch(getMeasurementsAsync(metric));
      } else if (info.state === MetricState.Initialized) {
        // add metric to chart
        // check if value axis exists for metric unit
        if (!chart?.yAxes.values.find((axis) => axis.id === info.unit)) {
          const syncAxis = chart?.yAxes.getIndex(0);

          const valueAxis = chart?.yAxes.push(new am4charts.ValueAxis());
          valueAxis!.id = info.unit!;
          valueAxis!.title.text = info.unit!;

          if (syncAxis) {
            valueAxis!.syncWithAxis = syncAxis as am4charts.ValueAxis;
          }
        }

        // create series for this metric
        const series = chart?.series.push(new am4charts.LineSeries());
        series!.name = metric;
        series!.dataFields.dateX = 'date';
        series!.dataFields.valueY = metric;
        series!.tooltipText = '{valueY.value}';
        series!.yAxis = chart?.yAxes.values.find((axis) => axis.id === info.unit!)!;

        // update chart data points
        chart!.data = [...dataPoints];

        // update metric state
        dispatch(setMetricState({ metric, newState: MetricState.Plotted }));
      } else if (info.state === MetricState.Plotted) {
        // establish subscription when first chart is working...
        if (Object.keys(metricsInfo).length === 1) {
          dispatch(getNewMeasurementsAsync());
        }
      } else if (info.state === MetricState.Removed) {
        // remove series
        const series = chart?.series.values.find((seriez) => seriez.name === metric);

        if (!series) {
          return; // already disposed
        }

        // If it's only series on yAxis, remove axis too
        if (!chart?.series.values.some((seriez) => seriez !== series && seriez.yAxis === series.yAxis)) {
          chart?.yAxes.removeValue(series.yAxis);
        }

        chart?.series.removeValue(series);
      }
    });
  }, [metricsInfo]);

  useEffect(() => {
    if (chart?.data.length) {
      const chartLastItem = chart.data[chart.data.length - 1];

      // find new items that are not in the chart (date is bigger than last item of chart)
      let idx = dataPoints.length - 1;
      while (dataPoints[idx].date > chartLastItem.date) {
        idx -= 1;
      }

      if (idx === dataPoints.length - 1) {
        return; // no new value
      }

      // add new items to the chart if all metric values received
      for (; idx < dataPoints.length; idx += 1) {
        if (Object.keys(dataPoints[idx]).length - 1 === selectedMetrics.length) {
          chart.addData(dataPoints[idx], 1); // remove an old item to keep scale
        }
      }
    }
  }, [Math.floor(Date.now()) / 1000]); // run function every one second to avoid process

  return <div id="chart" className={styles.container} />;
};
