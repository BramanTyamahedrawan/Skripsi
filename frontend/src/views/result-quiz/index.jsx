/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Collapse,
  Form,
  Input,
  Radio,
  Select,
  Table,
  message,
} from "antd";
import { getAttemptQuizByQuizID } from "@/api/attemptQuiz";
import { FileOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import TypingCard from "@/components/TypingCard";

const { Column } = Table;
const { Panel } = Collapse;

const ResultQuiz = () => {
  const [quiz, setQuiz] = useState([]);
  const [filename, setFilename] = useState("file-nilai");
  const [bookType, setBookType] = useState("xlsx");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [autoWidth, setAutoWidth] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const { id } = useParams();

  const getResultQuiz = async (id) => {
    try {
      const result = await getAttemptQuizByQuizID(id);
      const { content, statusCode } = result.data;

      if (statusCode === 200) {
        setQuiz(content);
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    }
  };

  useEffect(() => {
    getResultQuiz(id);
  }, [id]);

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRows(selectedRows);
    setSelectedRowKeys(selectedRowKeys);
  };

  const formatJson = (filterVal, jsonData) => {
    return jsonData.map((obj) =>
      filterVal.map((property) => {
        const nestedProperties = property.split(".");
        let value = obj;
        for (const nestedProperty of nestedProperties) {
          if (value && typeof value === "object" && nestedProperty in value) {
            value = value[nestedProperty];
          } else {
            value = undefined;
            break;
          }
        }
        return value;
      })
    );
  };

  const handleDownload = async (type) => {
    if (type === "selected" && selectedRowKeys.length === 0) {
      message.error("Error");
      return;
    }

    setDownloadLoading(true);

    try {
      const excel = await import("@/lib/Export2Excel");
      const tHeader = [
        "Id",
        "Nama Mahasiswa",
        "Nilai Minimum",
        "Nilai",
        "Status",
      ];

      const filterVal = [
        "id",
        "student.name",
        "quiz.min_grade",
        "grade",
        "state",
      ];

      const list = type === "all" ? quiz : selectedRows;
      const data = formatJson(filterVal, list);

      excel.export_json_to_excel({
        header: tHeader,
        data,
        filename,
        autoWidth,
        bookType,
      });

      setSelectedRowKeys([]);
      setDownloadLoading(false);
    } catch (error) {
      console.error("Error downloading:", error);
      setDownloadLoading(false);
    }
  };

  const handleAutoWidthChange = (e) => {
    setAutoWidth(e.target.value);
  };

  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };

  const handleBookTypeChange = (value) => {
    setBookType(value);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const cardContent = `Di sini, Anda dapat mengelola ResultQuiz sesuai dengan mata kuliah yang diampu. Di bawah ini dapat menampilkan list ResultQuiz yang ada.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Hasil Kuis" source={cardContent} />
      <br />
      <Collapse defaultActiveKey={["1"]}>
        <Panel header="Opsi ekspor" key="1">
          <Form layout="inline">
            <Form.Item label="Nama File:">
              <Input
                style={{ width: "250px" }}
                prefix={<FileOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Silakan masukkan nama file (file-nilai default)"
                onChange={handleFilenameChange}
              />
            </Form.Item>
            <Form.Item label="Apakah lebar sel adaptif:">
              <Radio.Group onChange={handleAutoWidthChange} value={autoWidth}>
                <Radio value={true}>Ya</Radio>
                <Radio value={false}>Tidak</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Jenis Berkas:">
              <Select
                defaultValue="xlsx"
                style={{ width: 120 }}
                onChange={handleBookTypeChange}
              >
                <Select.Option value="xlsx">xlsx</Select.Option>
                <Select.Option value="csv">csv</Select.Option>
                <Select.Option value="txt">txt</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon="file-excel"
                onClick={() => handleDownload("all")}
              >
                Ekspor Semua
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon="file-excel"
                onClick={() => handleDownload("selected")}
              >
                Ekspor item yang dipilih
              </Button>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>
      <br />
      <Card>
        <Table
          bordered
          rowKey={(record) => record.id}
          dataSource={quiz}
          pagination={false}
          rowSelection={rowSelection}
          loading={downloadLoading}
        >
          <Column
            title="Nama Siswa"
            dataIndex="student.name"
            key="student.name"
            align="center"
          />
          <Column
            title="Nilai Minimal"
            dataIndex="quiz.min_grade"
            key="quiz.min_grade"
            align="center"
          />
          <Column title="Nilai" dataIndex="grade" key="grade" align="center" />
          <Column title="Status" dataIndex="state" key="state" align="center" />
        </Table>
      </Card>
    </div>
  );
};

export default ResultQuiz;
