import { CardHeader, Theme } from '@mui/material';
import { withStyles } from '@mui/styles';

const styles = (theme: Theme) => ({
  root: {
    background: theme.palette.primary.main,
  },
  title: {
    color: 'white',
  },
});
export default withStyles(styles)(CardHeader);
