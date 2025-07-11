import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface CustomButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  sx?: object;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const defaultSx = {
  borderRadius: 3,
  minHeight: 44,
  fontWeight: 500,
  textTransform: 'none',
};

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  onClick,
  variant = 'contained',
  color = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  sx = {},
  startIcon,
  endIcon,
  size = 'medium',
  ...rest
}) => (
  <Button
    onClick={onClick}
    variant={variant}
    color={color}
    disabled={disabled || loading}
    fullWidth={fullWidth}
    type={type}
    sx={{ ...defaultSx, ...sx }}
    startIcon={startIcon}
    endIcon={endIcon}
    size={size}
    {...rest}
  >
    {loading ? <CircularProgress size={24} color="inherit" /> : children}
  </Button>
);

export default CustomButton; 