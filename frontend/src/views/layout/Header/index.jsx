import { useEffect, useState } from "react";
import { Menu, Dropdown, Modal, Layout, Avatar } from "antd";
import { CaretDownFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, getUserInfo } from "@/store/actions";
import FullScreen from "@/components/FullScreen";
import Settings from "@/components/Settings";
import Hamburger from "@/components/Hamburger";
import BreadCrumb from "@/components/BreadCrumb";
import { reqUserInfo } from "@/api/user";
import "./index.less";

const { Header } = Layout;

const LayoutHeader = () => {
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();

  const { token, fixedHeader, sidebarCollapsed, showSettings } = useSelector(
    (state) => ({
      ...state.app,
      ...state.user,
      ...state.settings,
    })
  );

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await reqUserInfo();
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserInfo();
    token && dispatch(getUserInfo(token));
  }, [dispatch, token]);

  const handleLogout = () => {
    Modal.confirm({
      title: "Keluar",
      content: "Apakah Anda yakin ingin keluar?",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: () => {
        dispatch(logout(token));
      },
    });
  };

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    }
  };

  const getHeaderStyle = () => {
    if (fixedHeader) {
      return {
        width: sidebarCollapsed ? "calc(100% - 80px)" : "calc(100% - 200px)",
      };
    }
    return { width: "100%" };
  };

  const dropdownMenu = (
    <Menu onClick={handleMenuClick}>
      {user ? (
        <>
          <Menu.Item disabled>
            <div>
              <p>{user.name}</p>
              <p>{user.roles}</p>
            </div>
          </Menu.Item>
          <Menu.Item key="dashboard">
            <Link to="/dashboard">Beranda</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout">Logout</Menu.Item>
        </>
      ) : (
        <Menu.Item disabled>Loading...</Menu.Item>
      )}
    </Menu>
  );

  return (
    <>
      {fixedHeader && <Header />}
      <Header
        style={getHeaderStyle()}
        className={fixedHeader ? "fix-header" : ""}
      >
        <Hamburger />
        <BreadCrumb />

        <div className="right-menu">
          <FullScreen />
          {showSettings && <Settings />}

          <div className="dropdown-wrap">
            <Dropdown overlay={dropdownMenu}>
              <div style={{ display: "flex" }}>
                {user ? (
                  <Avatar shape="square" size="medium" src={user.avatar} />
                ) : (
                  <span>Loading...</span>
                )}
                <div style={{ top: 20 }}>
                  <CaretDownFilled style={{ fontSize: 20 }} />
                </div>
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>
    </>
  );
};

export default LayoutHeader;
