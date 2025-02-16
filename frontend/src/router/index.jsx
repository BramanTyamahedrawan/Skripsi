import React from "react";
import PropTypes from "prop-types";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserInfo } from "@/store/actions";
import Layout from "@/views/layout";
import Login from "@/views/login";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.user);

  React.useEffect(() => {
    if (token && !role) {
      dispatch(getUserInfo(token));
    }
  }, [token, role, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const Router = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default Router;
