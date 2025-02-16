/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Drawer, Switch, Row, Col, Divider } from "antd";
import { toggleSettingPanel, changeSetting } from "@/store/actions";
import clip from "@/utils/clipboard";

const RightPanel = () => {
  const dispatch = useDispatch();
  const {
    settingPanelVisible,
    sidebarLogo: defaultSidebarLogo,
    fixedHeader: defaultFixedHeader,
    tagsView: defaultTagsView,
  } = useSelector((state) => ({
    ...state.app,
    ...state.settings,
  }));

  const [sidebarLogo, setSidebarLogo] = useState(defaultSidebarLogo);
  const [fixedHeader, setFixedHeader] = useState(defaultFixedHeader);
  const [tagsView, setTagsView] = useState(defaultTagsView);

  const handleSettingChange = (key, checked) => {
    dispatch(changeSetting({ key, value: checked }));
  };

  const handleSidebarLogoChange = (checked) => {
    setSidebarLogo(checked);
    handleSettingChange("sidebarLogo", checked);
  };

  const handleFixedHeaderChange = (checked) => {
    setFixedHeader(checked);
    handleSettingChange("fixedHeader", checked);
  };

  const handleTagsViewChange = (checked) => {
    setTagsView(checked);
    handleSettingChange("tagsView", checked);
  };

  const handleCopy = (e) => {
    const config = `
    export default {
      showSettings: true,
      sidebarLogo: ${sidebarLogo},
      fixedHeader: ${fixedHeader},
      tagsView: ${tagsView},
    }
    `;
    clip(config, e);
  };

  const handleClose = () => {
    dispatch(toggleSettingPanel());
  };

  const switchProps = {
    checkedChildren: "Iya",
    unCheckedChildren: "Tidak",
  };

  return (
    <div className="rightSettings">
      <Drawer
        title="Pengaturan Sistem"
        placement="right"
        width={350}
        onClose={handleClose}
        visible={settingPanelVisible}
      >
        <Row>
          <Col span={12}>
            <span>Logo Sidebar</span>
          </Col>
          <Col span={12}>
            <Switch
              {...switchProps}
              defaultChecked={sidebarLogo}
              onChange={handleSidebarLogoChange}
            />
          </Col>
        </Row>
        <Divider dashed />

        <Row>
          <Col span={12}>
            <span>Tampilkan Header</span>
          </Col>
          <Col span={12}>
            <Switch
              {...switchProps}
              defaultChecked={fixedHeader}
              onChange={handleFixedHeaderChange}
            />
          </Col>
        </Row>
        <Divider dashed />

        <Row>
          <Col span={12}>
            <span>Aktifkan Tags-View</span>
          </Col>
          <Col span={12}>
            <Switch
              {...switchProps}
              defaultChecked={tagsView}
              onChange={handleTagsViewChange}
            />
          </Col>
        </Row>
        <Divider dashed />
      </Drawer>
    </div>
  );
};

export default RightPanel;
