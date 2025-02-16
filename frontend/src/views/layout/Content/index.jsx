import { useSelector } from "react-redux";
import { useLocation, Routes, Route } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Layout } from "antd";
import DocumentTitle from "react-document-title";
import menuList from "@/config/menuConfig";
import routeList from "@/config/routeMap";
import { getMenuItemInMenuListByProperty } from "@/utils";

const { Content } = Layout;

// ✅ Fungsi untuk mendapatkan title halaman dari menuList
const getPageTitle = (menuList, pathname) => {
  let title = "Bank Soal X Polinema";
  let item = getMenuItemInMenuListByProperty(menuList, "path", pathname);
  if (item) {
    title = `${item.title} - Bank Soal X Polinema`;
  }
  return title;
};

const LayoutContent = () => {
  const location = useLocation(); // ✅ Gunakan useLocation() untuk mendapatkan pathname
  const { pathname } = location;
  const role = useSelector((state) => state.user.role); // ✅ Gunakan useSelector() untuk mendapatkan role dari Redux

  // ✅ Fungsi untuk memfilter route berdasarkan role user
  const handleFilter = (route) => {
    return role === "admin" || !route.roles || route.roles.includes(role);
  };

  return (
    <DocumentTitle title={getPageTitle(menuList, pathname)}>
      <Content style={{ height: "calc(100% - 100px)" }}>
        <TransitionGroup>
          <CSSTransition
            key={pathname}
            timeout={500}
            classNames="fade"
            exit={false}
          >
            <Routes location={location}>
              {routeList.map((route) =>
                handleFilter(route) ? (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<route.component />}
                  />
                ) : null
              )}
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </Content>
    </DocumentTitle>
  );
};

export default LayoutContent;
