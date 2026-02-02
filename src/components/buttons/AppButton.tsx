import React from 'react'
import { HashLoader } from 'react-spinners'

interface AppButtonProps {
  label: string;
  variant: 'red' | 'green' | 'orange' | 'outline' | 'blue' | 'purple' | 'yellow' | 'gray' | 'lightGreen' | 'lightOrange' | 'lightRed' | 'lightYellow' | 'lightBlue' | 'lightPurple';
  onClick?: () => void;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({
  label,
  variant,
  onClick,
  icon,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  fullWidth = false
}) => {
  let baseClassName = ''
  switch (variant) {
    case 'red':
      baseClassName = 'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer'
      break
    case 'green':
      baseClassName = 'px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 cursor-pointer'
      break
    case 'outline':
      baseClassName = 'px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer'
      break
    case 'orange':
      baseClassName = 'px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors duration-200 cursor-pointer'
      break
    case 'blue':
      baseClassName = 'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer'
      break
    case 'purple':
      baseClassName = 'px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors duration-200 cursor-pointer'
      break
    case 'yellow':
      baseClassName = 'px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors duration-200 cursor-pointer'
      break
    case 'gray':
      baseClassName = 'px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer'
      break
    case 'lightGreen':
      baseClassName = 'px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-200 transition-colors duration-200 cursor-pointer'
      break
    case 'lightOrange':
      baseClassName = 'px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-200 transition-colors duration-200 cursor-pointer'
      break
    case 'lightRed':
      baseClassName = 'px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-200 transition-colors duration-200 cursor-pointer'
      break
    case 'lightYellow':
      baseClassName = 'px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-200 transition-colors duration-200 cursor-pointer'
      break
    case 'lightBlue':
      baseClassName = 'px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-200 transition-colors duration-200 cursor-pointer'
      break
    case 'lightPurple':
      baseClassName = 'px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-200 transition-colors duration-200 cursor-pointer'
      break
    default:
      baseClassName = 'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer'
  }

  const buttonClassName = `
    ${baseClassName}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
    flex items-center justify-center gap-2
  `

  return (
    <button
      type={type}
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <HashLoader color="#ffffff" size={16} />
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

export default AppButton
