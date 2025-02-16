import { connect } from "react-redux";
import { Tooltip } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { toggleSettingPanel } from "@/store/actions";
import PropTypes from "prop-types";
import "./index.less";
const Settings = (props) => {
  const { toggleSettingPanel } = props;
  return (
    <div className="settings-container">
      <Tooltip placement="bottom" title="Pengaturan Sistem">
        <SettingOutlined onClick={toggleSettingPanel} />
      </Tooltip>
    </div>
  );
};
Settings.propTypes = {
  toggleSettingPanel: PropTypes.func.isRequired,
};

export default connect(null, { toggleSettingPanel })(Settings);
