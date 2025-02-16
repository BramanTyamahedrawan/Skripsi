/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars-2";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { addTag } from "@/store/actions";
import { getMenuItemInMenuListByProperty } from "@/utils";
import menuList from "@/config/menuConfig";
import "./index.less";

const { SubMenu } = Menu;

// Reorder array helper
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const MenuComponent = () => {
  const [menuTreeNode, setMenuTreeNode] = useState([]);
  const [openKey, setOpenKey] = useState([]);

  const location = useLocation();
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.user);

  const filterMenuItem = (item) => {
    const { roles } = item;
    if (role === "admin" || !roles || roles.includes(role)) {
      return true;
    }
    if (item.children) {
      return !!item.children.find((child) => roles.includes(child.role));
    }
    return false;
  };

  const getMenuNodes = (menuItems) => {
    const path = location.pathname;

    return menuItems.reduce((acc, item) => {
      if (!filterMenuItem(item)) return acc;

      if (!item.children) {
        acc.push(
          <Menu.Item key={item.path}>
            <Link to={item.path}>
              {item.icon}
              <span>{item.title}</span>
            </Link>
          </Menu.Item>
        );
      } else {
        const cItem = item.children.find(
          (child) => path.indexOf(child.path) === 0
        );

        if (cItem) {
          setOpenKey((prev) => [...prev, item.path]);
        }

        acc.push(
          <SubMenu
            key={item.path}
            title={
              <span>
                {item.icon}
                <span>{item.title}</span>
              </span>
            }
          >
            {getMenuNodes(item.children)}
          </SubMenu>
        );
      }
      return acc;
    }, []);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = reorder(
      menuTreeNode,
      result.source.index,
      result.destination.index
    );
    setMenuTreeNode(items);
  };

  const handleMenuSelect = ({ key = "/dashboard" }) => {
    const menuItem = getMenuItemInMenuListByProperty(menuList, "path", key);
    dispatch(addTag(menuItem));
  };

  useEffect(() => {
    const nodes = getMenuNodes(menuList);
    setMenuTreeNode(nodes);
    handleMenuSelect({ key: openKey[0] });
  }, []);

  return (
    <div className="sidebar-menu-container">
      <Scrollbars autoHide autoHideTimeout={1000} autoHideDuration={200}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {menuTreeNode.map((item, index) => (
                  <Draggable
                    key={item.key}
                    draggableId={item.key}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Menu
                          mode="inline"
                          theme="dark"
                          onSelect={handleMenuSelect}
                          selectedKeys={[location.pathname]}
                          defaultOpenKeys={openKey}
                        >
                          {item}
                        </Menu>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Scrollbars>
    </div>
  );
};

export default MenuComponent;
