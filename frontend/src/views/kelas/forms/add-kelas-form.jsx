/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { Form, Input, Modal } from "antd";

const AddKelasForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  return (
    <Modal
      title="Tambah Kelas"
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onOk(values);
          })
          .catch((error) => {
            console.log("Validation failed:", error);
          });
      }}
      confirmLoading={confirmLoading}
    >
      <Form {...formItemLayout} form={form}>
        <Form.Item
          label="ID Kelas:"
          name="idKelas"
          rules={[{ required: true, message: "Silahkan isikan ID Kelas" }]}
        >
          <Input placeholder="ID Kelas" />
        </Form.Item>

        <Form.Item
          label="Nama Kelas:"
          name="namaKelas"
          rules={[{ required: true, message: "Silahkan isikan Kelas" }]}
        >
          <Input placeholder="Nama Kelas" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddKelasForm;
