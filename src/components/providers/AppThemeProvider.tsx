import { ThemeProvider, createTheme } from '@mui/material';
import useThemeStore from '../../stores/state/ThemeStore';

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const theme = useThemeStore((s) => s.theme);

  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: { main: '#4f46e5' },
      background: {
        default: theme === 'dark' ? '#0f172a' : '#f8fafc',
        paper: theme === 'dark' ? '#1e293b' : '#ffffff',
      },
    },
  });

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
