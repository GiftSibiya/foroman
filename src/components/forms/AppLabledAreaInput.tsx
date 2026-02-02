import React from 'react'

interface AppLabeledAreaInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  disabled?: boolean;
}

const AppLabeledAreaInput: React.FC<AppLabeledAreaInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 4,
  disabled = false
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        className={`
          w-full px-3 py-2 text-sm border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          ${error ? 'border-red-300' : 'border-slate-200'}
          ${disabled ? 'bg-slate-50' : 'bg-white'}
          resize-none
        `}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p className="text-sm text-red-500" id={`${label}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export default AppLabeledAreaInput
