import { Breadcrumb } from "antd";
import { useLocation } from "react-router-dom"; // 🚀 Gunakan useLocation
import menuList from "@/config/menuConfig";
import "./index.less";

const getPath = (menuList, pathname) => {
  let temppath = [];
  try {
    function getNodePath(node) {
      temppath.push(node);
      if (node.path === pathname) {
        throw new Error("GOT IT!");
      }
      if (node.children && node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
          getNodePath(node.children[i]);
        }
        temppath.pop();
      } else {
        temppath.pop();
      }
    }
    for (let i = 0; i < menuList.length; i++) {
      getNodePath(menuList[i]);
    }
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return temppath;
  }
};

const BreadCrumb = () => {
  const location = useLocation(); // ✅ Mengambil lokasi saat ini dari Router
  const { pathname } = location;

  let path = getPath(menuList, pathname);
  const first = path && path[0];
  if (first && first.title.trim() !== "Beranda") {
    path = [{ title: "Beranda", path: "/dashboard" }].concat(path);
  }

  return (
    <div className="Breadcrumb-container">
      <Breadcrumb>
        {path &&
          path.map((item) =>
            item.title === "Beranda" ? (
              <Breadcrumb.Item key={item.path}>
                <a href={`#${item.path}`}>{item.title}</a>
              </Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item key={item.path}>{item.title}</Breadcrumb.Item>
            )
          )}
      </Breadcrumb>
    </div>
  );
};

export default BreadCrumb;
