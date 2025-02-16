/* eslint-disable no-unused-vars */
import React from "react";
import { useSelector } from "react-redux";
import { Layout } from "antd";
import Logo from "./Logo";
import Menu from "./Menu";

const { Sider } = Layout;

const LayoutSider = () => {
  const { sidebarCollapsed, sidebarLogo } = useSelector((state) => ({
    ...state.app,
    ...state.settings,
  }));

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      trigger={null}
      style={{ zIndex: "10" }}
    >
      {sidebarLogo && <Logo />}
      <Menu />
    </Sider>
  );
};

export default LayoutSider;
