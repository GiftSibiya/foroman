import { ThemeProvider, createTheme } from '@mui/material';
import useThemeStore from '@stores/state/ThemeStore';

interface MRTThemeProviderProps {
  children: React.ReactNode;
}

const MRTThemeProvider: React.FC<MRTThemeProviderProps> = ({ children }) => {
  const { theme } = useThemeStore();

  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      background: {
        default: theme === 'dark' ? '#1f2937' : '#ffffff',
        paper: theme === 'dark' ? '#1f2937' : '#ffffff',
      },
      text: {
        primary: theme === 'dark' ? '#ffffff' : '#111827',
        secondary: theme === 'dark' ? '#9ca3af' : '#4b5563',
      },
    },
    components: {
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
          },
        },
      },
    },
  });

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

export default MRTThemeProvider; 