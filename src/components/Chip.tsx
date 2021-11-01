import { withStyles } from '@mui/styles';
import { Chip, Theme } from '@mui/material';

const cardStyles = (theme: Theme) => ({
  root: {
    background: theme.palette.secondary.main,
  },
  label: {
    color: theme.palette.primary.main,
  },
});
export default withStyles(cardStyles)(Chip);
