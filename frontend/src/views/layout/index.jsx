import { useSelector } from "react-redux";
import { Layout } from "antd";
import Content from "./Content";
import Header from "./Header";
import RightPanel from "./RightPanel";
import Sider from "./Sider";
import TagsView from "./TagsView";

const Main = () => {
  const { tagsView } = useSelector((state) => state.settings);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider />
      <Layout>
        <Header />
        {tagsView && <TagsView />}
        <Content />
        <RightPanel />
      </Layout>
    </Layout>
  );
};

export default Main;
