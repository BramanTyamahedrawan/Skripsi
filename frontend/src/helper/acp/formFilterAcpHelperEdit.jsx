/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Form, Select } from "antd";

export const useFormFilterEditAcp = (currentRowData, initialData) => {
  const [filterState, setFilterState] = useState({
    tahunAjaranList: [],
    semesterList: [],
    kelasList: [],
    mapelList: [],
    elemenList: [],
    acpList: [],
    availableSemesters: [],
    availableKelas: [],
    availableMapels: [],
    availableElemen: [],
    availableAcp: [],
  });

  // Inisialisasi data
  useEffect(() => {
    if (initialData && currentRowData) {
      const {
        tahunAjaranList,
        semesterList,
        kelasList,
        mapelList,
        elemenList,
        acpList,
      } = initialData;

      const availableSemesters = getAvailableSemesters(
        currentRowData?.tahunAjaran?.idTahun,
        semesterList,
        mapelList,
        elemenList,
        acpList
      );

      const availableKelas = getAvailableKelas(
        currentRowData?.tahunAjaran?.idTahun,
        currentRowData?.semester?.idSemester,
        kelasList,
        mapelList,
        elemenList,
        acpList
      );

      const availableMapels = getAvailableMapels(
        currentRowData?.tahunAjaran?.idTahun,
        currentRowData?.semester?.idSemester,
        currentRowData?.kelas?.idKelas,
        mapelList,
        elemenList,
        acpList
      );

      const availableElemen = getAvailableElemen(
        currentRowData?.tahunAjaran?.idTahun,
        currentRowData?.semester?.idSemester,
        currentRowData?.kelas?.idKelas,
        currentRowData?.mapel?.idMapel,
        elemenList,
        acpList
      );

      const availableAcp = getAvailableAcp(
        currentRowData?.tahunAjaran?.idTahun,
        currentRowData?.semester?.idSemester,
        currentRowData?.kelas?.idKelas,
        currentRowData?.mapel?.idMapel,
        currentRowData?.elemen?.idElemen,
        acpList
      );

      setFilterState({
        tahunAjaranList,
        semesterList,
        kelasList,
        mapelList,
        elemenList,
        acpList,
        availableSemesters,
        availableKelas,
        availableMapels,
        availableElemen,
        availableAcp,
      });
    }
  }, [initialData, currentRowData]);

  const getAvailableSemesters = (tahunAjaranId, semesterList, acpList) => {
    if (!tahunAjaranId) return [];
    return semesterList.filter((semester) =>
      acpList.some(
        (acp) =>
          acp.tahunAjaran?.idTahun === tahunAjaranId &&
          acp.semester?.idSemester === semester.idSemester
      )
    );
  };

  const getAvailableKelas = (tahunAjaranId, semesterId, kelasList, acpList) => {
    if (!tahunAjaranId || !semesterId) return [];

    return kelasList.filter((kelas) =>
      acpList.some(
        (acp) =>
          acp.tahunAjaran?.idTahun === tahunAjaranId &&
          acp.semester?.idSemester === semesterId &&
          acp.kelas?.idKelas === kelas.idKelas
      )
    );
  };

  const getAvailableMapels = (
    tahunAjaranId,
    semesterId,
    kelasId,
    mapelList,
    acpList
  ) => {
    if (!tahunAjaranId || !semesterId || !kelasId) return [];

    return mapelList.filter((mapel) =>
      acpList.some(
        (acp) =>
          acp.tahunAjaran?.idTahun === tahunAjaranId &&
          acp.semester?.idSemester === semesterId &&
          acp.kelas?.idKelas === kelasId &&
          acp.mapel?.idMapel === mapel.idMapel
      )
    );
  };

  const getAvailableElemen = (
    tahunAjaranId,
    semesterId,
    kelasId,
    mapelId,
    elemenList,
    acpList
  ) => {
    if (!tahunAjaranId || !semesterId || !kelasId || !mapelId) return [];

    return elemenList.filter((elemen) =>
      acpList.some(
        (acp) =>
          acp.tahunAjaran?.idTahun === tahunAjaranId &&
          acp.semester?.idSemester === semesterId &&
          acp.kelas?.idKelas === kelasId &&
          acp.mapel?.idMapel === mapelId &&
          acp.elemen?.idElemen === elemen.idElemen
      )
    );
  };

  const getAvailableAcp = (
    tahunAjaranId,
    semesterId,
    kelasId,
    mapelId,
    elemenId,
    acpList
  ) => {
    if (!tahunAjaranId || !semesterId || !kelasId || !mapelId || !elemenId)
      return [];

    const filtered = acpList.filter(
      (acp) =>
        acp.tahunAjaran?.idTahun === tahunAjaranId &&
        acp.semester?.idSemester === semesterId &&
        acp.kelas?.idKelas === kelasId &&
        acp.mapel?.idMapel === mapelId &&
        acp.elemen?.idElemen === elemenId
    );

    return filtered.reduce((acc, current) => {
      const x = acc.find((item) => item.name === current.name);
      if (!x) return acc.concat([current]);
      return acc;
    }, []);
  };

  const renderTahunAjaranSelect = (form) => (
    <Form.Item
      label="Tahun Ajaran"
      name="idTahun"
      rules={[{ required: true, message: "Silahkan pilih Tahun Ajaran" }]}
    >
      <Select
        placeholder="Pilih Tahun Ajaran"
        onChange={(idTahun) => {
          form.setFieldsValue({
            idSemester: null,
            idKelas: null,
            idMapel: null,
            idElemen: null,
            idAcp: null,
          });
          const availableSemesters = getAvailableSemesters(
            idTahun,
            filterState.semesterList,
            filterState.acpList
          );
          setFilterState((prev) => ({
            ...prev,
            availableSemesters,
            availableKelas: [],
            availableMapels: [],
            availableElemen: [],
            availableAcp: [],
          }));
        }}
      >
        {filterState.tahunAjaranList.map(({ idTahun, tahunAjaran }) => (
          <Select.Option key={idTahun} value={idTahun}>
            {tahunAjaran}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderSemesterSelect = (form) => {
    const selectedTahun = form.getFieldValue("idTahun");
    return (
      <Form.Item
        label="Semester"
        name="idSemester"
        rules={[{ required: true, message: "Silahkan pilih Semester" }]}
      >
        <Select
          placeholder="Pilih Semester"
          disabled={!selectedTahun}
          onChange={(idSemester) => {
            form.setFieldsValue({
              idKelas: null,
              idMapel: null,
              idElemen: null,
              idAcp: null,
            });
            const availableKelas = getAvailableKelas(
              form.getFieldValue("idTahun"),
              idSemester,
              filterState.kelasList,
              filterState.acpList
            );
            setFilterState((prev) => ({
              ...prev,
              availableKelas,
              availableMapels: [],
              availableElemen: [],
              availableAcp: [],
            }));
          }}
        >
          {filterState.availableSemesters.map(
            ({ idSemester, namaSemester }) => (
              <Select.Option key={idSemester} value={idSemester}>
                {namaSemester}
              </Select.Option>
            )
          )}
        </Select>
      </Form.Item>
    );
  };

  const renderKelasSelect = (form) => {
    const selectedTahun = form.getFieldValue("idTahun");
    const selectedSemester = form.getFieldValue("idSemester");
    return (
      <Form.Item
        label="Kelas"
        name="idKelas"
        rules={[{ required: true, message: "Silahkan pilih Kelas" }]}
      >
        <Select
          placeholder="Pilih Kelas"
          disabled={!selectedTahun || !selectedSemester}
          onChange={(idKelas) => {
            form.setFieldsValue({ idMapel: null, idElemen: null, idAcp: null });
            const availableMapels = getAvailableMapels(
              form.getFieldValue("idTahun"),
              form.getFieldValue("idSemester"),
              idKelas,
              filterState.mapelList,
              filterState.acpList
            );
            setFilterState((prev) => ({
              ...prev,
              availableMapels,
              availableElemen: [],
              availableAcp: [],
            }));
          }}
        >
          {filterState.availableKelas.map(({ idKelas, namaKelas }) => (
            <Select.Option key={idKelas} value={idKelas}>
              {namaKelas}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  };

  const renderMapelSelect = (form) => {
    const selectedTahun = form.getFieldValue("idTahun");
    const selectedSemester = form.getFieldValue("idSemester");
    const selectedKelas = form.getFieldValue("idKelas");
    return (
      <Form.Item
        label="Mapel"
        name="idMapel"
        rules={[{ required: true, message: "Silahkan pilih Mapel" }]}
      >
        <Select
          placeholder="Pilih Mapel"
          disabled={!selectedTahun || !selectedSemester || !selectedKelas}
          onChange={(idMapel) => {
            form.setFieldsValue({ idElemen: null, idAcp: null });
            const availableElemen = getAvailableElemen(
              form.getFieldValue("idTahun"),
              form.getFieldValue("idSemester"),
              form.getFieldValue("idKelas"),
              idMapel,
              filterState.elemenList,
              filterState.acpList
            );
            setFilterState((prev) => ({
              ...prev,
              availableElemen,
              availableAcp: [],
            }));
          }}
        >
          {filterState.availableMapels.map(({ idMapel, name }) => (
            <Select.Option key={idMapel} value={idMapel}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  };

  const renderElemenSelect = (form) => {
    const selectedTahun = form.getFieldValue("idTahun");
    const selectedSemester = form.getFieldValue("idSemester");
    const selectedKelas = form.getFieldValue("idKelas");
    const selectedMapel = form.getFieldValue("idMapel");
    return (
      <Form.Item
        label="Elemen"
        name="idElemen"
        rules={[{ required: true, message: "Silahkan pilih Elemen" }]}
      >
        <Select
          placeholder="Pilih Elemen"
          disabled={
            !selectedTahun ||
            !selectedSemester ||
            !selectedKelas ||
            !selectedMapel
          }
          onChange={(idElemen) => {
            form.setFieldsValue({ idAcp: null });
            const availableAcp = getAvailableAcp(
              form.getFieldValue("idTahun"),
              form.getFieldValue("idSemester"),
              form.getFieldValue("idKelas"),
              form.getFieldValue("idMapel"),
              idElemen,
              filterState.acpList
            );
            setFilterState((prev) => ({
              ...prev,
              availableAcp,
            }));
          }}
        >
          {filterState.availableElemen.map(({ idElemen, namaElemen }) => (
            <Select.Option key={idElemen} value={idElemen}>
              {namaElemen}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  };

  const renderAcpSelect = (form) => (
    <Form.Item
      label="Acp"
      name="idAcp"
      rules={[
        {
          required: true,
          message: "Silahkan pilih Analisi Capaian Pembelajaran",
        },
      ]}
    >
      <Select
        placeholder="Pilih Acp"
        disabled={filterState.availableAcp.length === 0}
      >
        {filterState.availableAcp.map(({ idAcp, namaAcp }) => (
          <Select.Option key={idAcp} value={idAcp}>
            {namaAcp}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  return {
    filterState,
    renderTahunAjaranSelect,
    renderSemesterSelect,
    renderKelasSelect,
    renderMapelSelect,
    renderElemenSelect,
    renderAcpSelect,
  };
};
