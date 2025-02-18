/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import { Layout } from 'antd'
import Logo from './Logo'
import SidebarMenu from './Menu'

const { Sider } = Layout

const LayoutSider = () => {
  const { sidebarCollapsed, sidebarLogo } = useSelector((state) => ({
    sidebarCollapsed: state.app.sidebarCollapsed,
    sidebarLogo: state.settings.sidebarLogo,
  }))

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      trigger={null}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        height: '100vh',
      }}
    >
      {sidebarLogo && <Logo />}
      <SidebarMenu />
    </Sider>
  )
}

export default LayoutSider
