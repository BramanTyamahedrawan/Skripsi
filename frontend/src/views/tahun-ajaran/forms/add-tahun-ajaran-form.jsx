/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { Form, Input, Modal, Select } from "antd";
import { getProgramKeahlian } from "@/api/programKeahlian";

const { TextArea } = Input;
const { Option } = Select;

const AddTahunAjaranForm = ({ visible, onCancel, onOk, confirmLoading }) => {
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
      title="Tambah Tahun Ajaran"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
    >
      <Form {...formItemLayout} form={form}>
        <Form.Item
          label="ID Tahun Ajaran:"
          name="idTahun"
          rules={[
            { required: true, message: "Silahkan isikan ID Tahun Ajaran" },
          ]}
        >
          <Input placeholder="ID Tahun Ajaran" />
        </Form.Item>

        <Form.Item
          label="Tahun Ajaran:"
          name="tahunAjaran"
          rules={[{ required: true, message: "Silahkan isikan Tahun Ajaran" }]}
        >
          <Input placeholder="Tahun Ajaran" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTahunAjaranForm;
