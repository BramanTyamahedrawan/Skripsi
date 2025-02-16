/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Form, Input, Select, Modal } from "antd";

const { TextArea } = Input;

const EditUserForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentRowData) {
      form.setFieldsValue({
        id: currentRowData.id,
        name: currentRowData.name,
        role: currentRowData.role,
        description: currentRowData.description,
      });
    }
  }, [currentRowData, form]);

  return (
    <Modal
      title="Mengedit Pengguna"
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
        <Form.Item label="ID Pengguna:" name="id">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Nama:"
          name="name"
          rules={[{ required: true, message: "Silahkan isi nama pengguna!" }]}
        >
          <Input placeholder="Nama Pengguna" />
        </Form.Item>
        <Form.Item label="Peran:" name="role">
          <Select
            style={{ width: 120 }}
            disabled={currentRowData?.id === "admin"}
          >
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="lecture">Editor</Select.Option>
            <Select.Option value="student">Guest</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Deskripsi Pengguna:" name="description">
          <TextArea rows={4} placeholder="Masukkan deskripsi pengguna" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserForm;
