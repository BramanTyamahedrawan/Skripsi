/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { Form, Input, Modal } from "antd";

const AddSemesterForm = ({ visible, onCancel, onOk, confirmLoading }) => {
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
      title="Tambah Semester"
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
          label="Nama Semester:"
          name="namaSemester"
          rules={[{ required: true, message: "Silahkan isikan Semester" }]}
        >
          <Input placeholder="Nama Semester" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSemesterForm;
