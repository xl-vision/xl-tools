import React from 'react'

export interface DemoProps {
  children: React.ReactNode
}

const Demo: React.FunctionComponent<DemoProps> = props => {
  const { children } = props
  return (
    <div className={'demo'}>{children}</div>
  )
}
