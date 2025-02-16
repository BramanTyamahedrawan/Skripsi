/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Form, Input, Select, Modal } from "antd";
import { reqUserInfo } from "../../../api/user";

const AddUserForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();
  const [userSummary, setUserSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reqUserInfo()
      .then((response) => {
        setUserSummary(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        setLoading(false);
      });
  }, []);

  const isAdministrator =
    userSummary && userSummary.roles === "ROLE_ADMINISTRATOR";
  const roleOptions = isAdministrator
    ? [
        { value: "1", label: "Administrator" },
        { value: "2", label: "Operator" },
      ]
    : [
        { value: "3", label: "Guru" },
        { value: "4", label: "Du/Di" },
        { value: "5", label: "Siswa" },
      ];
  const initialRoleValue = isAdministrator ? "1" : "3";

  return (
    <Modal
      title="Tambah Pengguna"
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onOk(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama:"
          name="name"
          rules={[{ required: true, message: "Silahkan isi nama pengguna!" }]}
        >
          <Input placeholder="Nama Pengguna" />
        </Form.Item>
        <Form.Item
          label="Username:"
          name="username"
          rules={[
            { required: true, message: "Silahkan isi username pengguna!" },
          ]}
        >
          <Input placeholder="Username Pengguna" />
        </Form.Item>
        <Form.Item
          label="Email:"
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Silahkan isi email pengguna!",
            },
          ]}
        >
          <Input placeholder="Email Pengguna" />
        </Form.Item>
        <Form.Item
          label="Kata sandi:"
          name="password"
          rules={[
            { required: true, message: "Silahkan isi kata sandi pengguna!" },
          ]}
        >
          <Input type="password" placeholder="Kata sandi" />
        </Form.Item>
        <Form.Item label="Peran:" name="roles" initialValue={initialRoleValue}>
          <Select style={{ width: 120 }}>
            {roleOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Sekolah:" name="schoolId" initialValue="RWK001">
          <Select style={{ width: 240 }}>
            <Select.Option value="RWK001">
              SMK Negeri Rowokangkung
            </Select.Option>
            <Select.Option value="TMP001">SMK Negeri Tempeh</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserForm;
