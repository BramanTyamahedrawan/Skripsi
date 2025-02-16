/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Form, Input, Button, message, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import DocumentTitle from "react-document-title";
import { login, getUserInfo } from "@/store/actions";
import "./index.less";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  const handleLogin = async (values) => {
    const { username, password } = values;
    setLoading(true);

    try {
      const data = await dispatch(login(username, password));
      message.success("Selamat Datang di Website Kampus");
      await handleUserInfo(data.accessToken);
    } catch (error) {
      message.error(
        "Gagal Login, mohon di cek kembali username dan password nya"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUserInfo = async (token) => {
    try {
      await dispatch(getUserInfo(token));
    } catch (error) {
      message.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await handleLogin(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <DocumentTitle title="Login Pengguna">
      <div className="login-container">
        <Form
          form={form}
          onFinish={handleSubmit}
          className="content"
          initialValues={{
            username: "",
            password: "",
          }}
        >
          <div className="title">
            <h2>Login Pengguna</h2>
          </div>

          <Spin spinning={loading} tip="Mohon tunggu...">
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Username wajib diisi!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Kata sandi wajib diisi!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Kata sandi"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={loading}
              >
                Masuk
              </Button>
            </Form.Item>
          </Spin>
        </Form>
      </div>
    </DocumentTitle>
  );
};

export default Login;
