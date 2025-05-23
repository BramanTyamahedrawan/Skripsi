/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { Form, Input, Modal } from "antd";
const { TextArea } = Input;

const AddSubjectGroupForm = ({ visible, onCancel, onOk, confirmLoading }) => {
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

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="Tambah Rumpun Mata Kuliah"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
    >
      <Form {...formItemLayout} form={form}>
        <Form.Item
          label="Nama:"
          name="name"
          rules={[
            {
              required: true,
              message: "Silahkan isikan nama rumpun mata kuliah",
            },
          ]}
        >
          <Input placeholder="Nama Rumpun Mata Kuliah" />
        </Form.Item>

        <Form.Item
          label="Deskripsi:"
          name="description"
          rules={[
            {
              required: true,
              message: "Silahkan isikan deskripsi rumpun mata kuliah",
            },
          ]}
        >
          <TextArea rows={4} placeholder="Deskripsi Rumpun Mata Kuliah" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSubjectGroupForm;
