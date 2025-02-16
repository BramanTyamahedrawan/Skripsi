import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars-2";
import { Tag } from "antd";
import { deleteTag, emptyTaglist, closeOtherTags } from "@/store/actions";

const TagList = () => {
  const tagListContainer = useRef();
  const contextMenuContainer = useRef();
  const [menuState, setMenuState] = useState({
    left: 0,
    top: 0,
    menuVisible: false,
    currentTag: null,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const taglist = useSelector((state) => state.tagsView.taglist);

  const handleClose = (tag) => {
    const path = tag.path;
    const currentPath = location.pathname;
    const length = taglist.length;

    if (path === currentPath) {
      navigate(taglist[length - 1].path);
    }

    if (
      path === taglist[length - 1].path &&
      currentPath === taglist[length - 1].path
    ) {
      if (length - 2 > 0) {
        navigate(taglist[length - 2].path);
      } else if (length === 2) {
        navigate(taglist[0].path);
      }
    }

    dispatch(deleteTag(tag));
  };

  const handleClick = (path) => {
    navigate(path);
  };

  const openContextMenu = (tag, event) => {
    event.preventDefault();
    const menuMinWidth = 105;
    const clickX = event.clientX;
    const clickY = event.clientY;
    const clientWidth = tagListContainer.current.clientWidth;
    const maxLeft = clientWidth - menuMinWidth;

    if (clickX > maxLeft) {
      setMenuState({
        left: clickX - menuMinWidth + 15,
        top: clickY,
        menuVisible: true,
        currentTag: tag,
      });
    } else {
      setMenuState({
        left: clickX,
        top: clickY,
        menuVisible: true,
        currentTag: tag,
      });
    }
  };

  const handleClickOutside = (event) => {
    const isOutside = !(
      contextMenuContainer.current &&
      contextMenuContainer.current.contains(event.target)
    );
    if (isOutside && menuState.menuVisible) {
      closeContextMenu();
    }
  };

  const closeContextMenu = () => {
    setMenuState((prev) => ({
      ...prev,
      menuVisible: false,
    }));
  };

  useEffect(() => {
    document.body.addEventListener("click", handleClickOutside);
    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleCloseAllTags = () => {
    dispatch(emptyTaglist());
    navigate("/dashboard");
    closeContextMenu();
  };

  const handleCloseOtherTags = () => {
    const { currentTag } = menuState;
    const { path } = currentTag;
    dispatch(closeOtherTags(currentTag));
    navigate(path);
    closeContextMenu();
  };

  const { left, top, menuVisible } = menuState;
  const currentPath = location.pathname;

  return (
    <>
      <Scrollbars
        autoHide
        autoHideTimeout={1000}
        autoHideDuration={200}
        hideTracksWhenNotNeeded={true}
        renderView={(props) => (
          <div {...props} className="scrollbar-container" />
        )}
        renderTrackVertical={(props) => (
          <div {...props} className="scrollbar-track-vertical" />
        )}
      >
        <ul className="tags-wrap" ref={tagListContainer}>
          {taglist.map((tag) => (
            <li key={tag.path}>
              <Tag
                onClose={() => handleClose(tag)}
                closable={tag.path !== "/dashboard"}
                color={currentPath === tag.path ? "geekblue" : "gold"}
                onClick={() => handleClick(tag.path)}
                onContextMenu={(e) => openContextMenu(tag, e)}
              >
                {tag.title}
              </Tag>
            </li>
          ))}
        </ul>
      </Scrollbars>
      {menuVisible && (
        <ul
          className="contextmenu"
          style={{ left: `${left}px`, top: `${top}px` }}
          ref={contextMenuContainer}
        >
          <li onClick={handleCloseOtherTags}>关闭其他</li>
          <li onClick={handleCloseAllTags}>关闭所有</li>
        </ul>
      )}
    </>
  );
};

export default TagList;
