import { ApolloProvider, gql, useQuery } from '@apollo/client';
import { Typography, LinearProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import { useGeolocation } from 'react-use';
import { GqlClient } from '../../app/gql-client';
import Chip from '../../components/Chip';

const toF = (c: number) => (c * 9) / 5 + 32;

const query = gql`
  query ($latLong: WeatherQuery!) {
    getWeatherForLocation(latLong: $latLong) {
      description
      locationName
      temperatureinCelsius
    }
  }
`;

type WeatherData = {
  temperatureinCelsius: number;
  description: string;
  locationName: string;
};
type WeatherDataResponse = {
  getWeatherForLocation: WeatherData;
};

const useStyles = makeStyles({
  chip: {
    '& > span': {
      color: '#fff !important',
    },
  },
});

const Weather: FC = () => {
  const styles = useStyles();
  const getLocation = useGeolocation();
  // Default to houston
  const latLong = {
    latitude: getLocation.latitude || 29.7604,
    longitude: getLocation.longitude || -95.3698,
  };
  const { loading, error, data } = useQuery<WeatherDataResponse>(query, {
    variables: {
      latLong,
    },
  });

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return <Chip className={styles.chip} label="Weather not found" />;
  const { locationName, description, temperatureinCelsius } = data.getWeatherForLocation;

  return (
    <Chip
      className={styles.chip}
      label={`Weather in ${locationName}: ${description} and ${Math.round(toF(temperatureinCelsius))}°`}
    />
  );
};

export default () => (
  <ApolloProvider client={GqlClient}>
    <Weather />
  </ApolloProvider>
);
