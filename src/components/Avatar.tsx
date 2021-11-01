import { Avatar, Theme } from '@mui/material';
import { withStyles } from '@mui/styles';

const styles = (theme: Theme) => ({
  root: {
    background: theme.palette.primary.main,
    marginRight: '1rem',
  },
});
export default withStyles(styles)(Avatar);
