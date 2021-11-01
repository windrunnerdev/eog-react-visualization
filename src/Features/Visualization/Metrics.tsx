import React, { FC, SyntheticEvent, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, TextField } from '@mui/material';
import { useAppSelector } from '../../app/hooks';
import { removeSelectedMetric, selectMetrics, addSelectedMetric, getMetricsAsync } from './visualizationSlice';

const useStyles = makeStyles({
  container: {
    padding: '30px 40px',
  },
});

export const Metrics: FC = () => {
  const styles = useStyles();
  const metrics = useAppSelector(selectMetrics);
  const dispatch = useDispatch();

  // dispatch action for getting metrics from API
  useEffect(() => {
    dispatch(getMetricsAsync());
  }, []);

  const handleOnChange = (
    event: SyntheticEvent,
    value: string[],
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<string>,
  ) => {
    // dispatch actions based on event reason
    if (reason === 'selectOption') {
      dispatch(addSelectedMetric(details!.option));
    } else if (reason === 'removeOption') {
      dispatch(removeSelectedMetric(details!.option));
    }
  };

  return (
    <div className={styles.container}>
      <Autocomplete
        multiple
        id="metrics"
        disableClearable={false}
        options={metrics}
        getOptionLabel={(option) => option}
        renderInput={(params) => (
          <TextField {...params} variant="standard" label="Select Metrics" placeholder="Metrics" />
        )}
        onChange={handleOnChange}
      />
    </div>
  );
};
