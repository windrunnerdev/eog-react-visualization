import React, { FC, useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { Chart } from './Chart';
import { Metrics } from './Metrics';
import { getMetricsAsync } from './visualizationSlice';

const Visualization: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getMetricsAsync());
  }, []);

  return (
    <div>
      <Metrics />
      <Chart />
    </div>
  );
};

export default Visualization;
