import { fieldRoot, fieldLabel, helperText, helperLink } from './formStyles'

interface FormFieldProps {
  label: string
  children: React.ReactNode
  helperPrefix?: string
  helperLinkText?: string
  helperSuffix?: string
}

export default function FormField({ label, children, helperPrefix, helperLinkText, helperSuffix }: FormFieldProps) {
  return (
    <div className={fieldRoot}>
      <label className={fieldLabel}>{label}</label>
      {children}
      {(helperPrefix || helperLinkText) && (
        <p className={helperText}>
          {helperPrefix}
          {helperLinkText && <span className={helperLink}>{helperLinkText}</span>}
          {helperSuffix}
        </p>
      )}
    </div>
  )
}
