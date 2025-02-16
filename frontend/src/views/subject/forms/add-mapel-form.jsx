/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { Form, Input, Modal, Select } from "antd";
const { Option } = Select;

const AddSubjectForm = ({ visible, onCancel, onOk, confirmLoading }) => {
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
      title="Tambah Mata Pelajaran"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
    >
      <Form {...formItemLayout} form={form}>
        <Form.Item
          label="ID Mapel:"
          name="idMapel"
          rules={[
            { required: true, message: "Silahkan isikan id bidang keahlian" },
          ]}
        >
          <Input placeholder="ID Mapel" />
        </Form.Item>

        <Form.Item
          label="Nama:"
          name="name"
          rules={[
            { required: true, message: "Silahkan isikan nama mata pelajaran" },
          ]}
        >
          <Input placeholder="Nama Mata Pelajaran" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSubjectForm;
