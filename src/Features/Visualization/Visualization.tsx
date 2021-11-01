import React, { FC } from 'react';
import { Chart } from './Chart';
import { Metrics } from './Metrics';

const Visualization: FC = () => (
  <div>
    <Metrics />
    <Chart />
  </div>
);

export default Visualization;
