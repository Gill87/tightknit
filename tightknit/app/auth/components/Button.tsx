import { primaryButton } from '../formStyles'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button className={`${primaryButton} ${className ?? ''}`} {...props}>
      {children}
    </button>
  )
}
