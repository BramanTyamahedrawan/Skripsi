/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Menu, Dropdown, Modal, Layout, Avatar } from "antd";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { logout, getUserInfo } from "@/store/actions";
import FullScreen from "@/components/FullScreen";
import Hamburger from "@/components/Hamburger";
import BreadCrumb from "@/components/BreadCrumb";
import "./index.less";
import { reqUserInfo } from "@/api/user";
import { CaretDownOutlined } from "@ant-design/icons";
import assets from "../../../assets";

const { Header } = Layout;

const LayoutHeader = (props) => {
  const { sidebarCollapsed } = props;
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user info
    reqUserInfo()
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });

    const { token, getUserInfo } = props;
    if (token) getUserInfo(token);
  }, [props]);

  const handleLogout = (token) => {
    Modal.confirm({
      title: "Logout",
      content: "Are you sure you want to log out?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        props.logout(token);
      },
    });
  };

  const onClick = ({ key }) => {
    switch (key) {
      case "logout":
        handleLogout(props.token);
        break;
      default:
        break;
    }
  };

  const computedStyle = () => {
    // if (fixedHeader) {
    return {
      width: sidebarCollapsed ? "calc(100% - 80px)" : "calc(100% - 200px)",
      marginLeft: sidebarCollapsed ? "80px" : "200px",
      position: "fixed",
    };
    // }
    // return {
    //   width: '100%',
    // }
  };

  const menu = (
    <Menu onClick={onClick}>
      {user ? (
        <div>
          <p
            style={{
              maxWidth: 180,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.name}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <Menu.Item key="dashboard">
        <Link to="/dashboard">Home</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">Logout</Menu.Item>
    </Menu>
  );

  return (
    <>
      {props.fixedHeader ? <Header /> : null}

      <Header
        style={computedStyle()}
        className={props.fixedHeader ? "fix-header" : ""}
      >
        <Hamburger />
        {sidebarCollapsed ? <></> : <BreadCrumb />}
        <div className="right-menu">
          <FullScreen />
          {/* {props.showSettings && <Settings />} */}
          <div className="dropdown-wrap">
            <Dropdown overlay={menu} destroyPopupOnHide>
              {/* Wrap children in a single container */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {user ? (
                  <Avatar
                    shape="square"
                    size="medium"
                    src={assets.images.avatar}
                  />
                ) : (
                  <p>Loading...</p>
                )}
                <CaretDownOutlined
                  style={{ color: "rgba(0,0,0,.3)", marginLeft: 8 }}
                />
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>
    </>
  );
};

const mapStateToProps = (state) => ({
  ...state.app,
  ...state.user,
  ...state.settings,
});

export default connect(mapStateToProps, { logout, getUserInfo })(LayoutHeader);
