/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Form, Select } from "antd";

export const useFormFilterACP = (initialData) => {
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
    selectedTahunAjaran: null,
    selectedSemester: null,
    selectedKelas: null,
    selectedMapel: null,
    selectedElemen: null,
  });

  // Inisialisasi data
  useEffect(() => {
    if (initialData) {
      setFilterState((prev) => ({
        ...prev,
        tahunAjaranList: initialData.tahunAjaranList || [],
        semesterList: initialData.semesterList || [],
        kelasList: initialData.kelasList || [],
        mapelList: initialData.mapelList || [],
        elemenList: initialData.elemenList || [],
        acpList: initialData.acpList || [],
      }));
    }
  }, [initialData]);

  // Handler perubahan select
  const handleTahunAjaranChange = (value, form) => {
    const newState = {
      selectedTahunAjaran: value,
      selectedSemester: null,
      selectedKelas: null,
      selectedMapel: null,
      selectedElemen: null,
      availableSemesters: getAvailableSemesters(
        value,
        filterState.semesterList,
        filterState.mapelList,
        filterState.elemenList,
        filterState.acpList
      ),
      availableKelas: [],
      availableMapels: [],
      availableElemen: [],
      availableAcp: [],
    };

    setFilterState((prev) => ({ ...prev, ...newState }));
    form?.setFieldsValue({
      idSemester: undefined,
      idKelas: undefined,
      idMapel: undefined,
      idElemen: undefined,
      idAcp: undefined,
    });
  };

  const handleSemesterChange = (value, form) => {
    const newState = {
      selectedSemester: value,
      selectedKelas: null,
      selectedMapel: null,
      selectedElemen: null,
      availableKelas: getAvailableKelas(
        filterState.selectedTahunAjaran,
        value,
        filterState.kelasList,
        filterState.mapelList,
        filterState.elemenList,
        filterState.acpList
      ),
      availableMapels: [],
      availableElemen: [],
      availableAcp: [],
    };

    setFilterState((prev) => ({ ...prev, ...newState }));
    form?.setFieldsValue({
      idKelas: undefined,
      idMapel: undefined,
      idElemen: undefined,
      idAcp: undefined,
    });
  };

  const handleKelasChange = (value, form) => {
    const newState = {
      selectedKelas: value,
      selectedMapel: null,
      selectedElemen: null,
      availableMapels: getAvailableMapels(
        filterState.selectedTahunAjaran,
        filterState.selectedSemester,
        value,
        filterState.mapelList,
        filterState.elemenList,
        filterState.acpList
      ),
      availableElemen: [],
    };

    setFilterState((prev) => ({ ...prev, ...newState }));
    form?.setFieldsValue({
      idMapel: undefined,
      idElemen: undefined,
      idAcp: undefined,
    });
  };

  const handleMapelChange = (value, form) => {
    const newState = {
      selectedMapel: value,
      selectedElemen: null,
      availableElemen: getAvailableElemens(
        filterState.selectedTahunAjaran,
        filterState.selectedSemester,
        filterState.selectedKelas,
        value,
        filterState.elemenList,
        filterState.acpList
      ),
    };

    setFilterState((prev) => ({ ...prev, ...newState }));
    form?.setFieldsValue({ idElemen: undefined, idAcp: undefined });
  };

  const handleElemenChange = (value, form) => {
    const newState = {
      selectedElemen: value,
      availableAcp: getAvailableAcp(
        filterState.selectedTahunAjaran,
        filterState.selectedSemester,
        filterState.selectedKelas,
        filterState.selectedMapel,
        value,
        filterState.acpList
      ),
    };

    setFilterState((prev) => ({ ...prev, ...newState }));
    form?.setFieldsValue({ idAcp: undefined });
  };

  // Fungsi filter
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

  const getAvailableElemens = (
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

    // Menggunakan reduce untuk menghapus duplikat berdasarkan nama elemen
    return filtered.reduce((acc, current) => {
      const x = acc.find((item) => item.name === current.name);
      if (!x) return acc.concat([current]);
      return acc;
    }, []);
  };

  // Komponen Select yang sudah dikonfigurasi
  const renderTahunAjaranSelect = (form) => (
    <Form.Item
      label="Tahun Ajaran"
      name="idTahun"
      rules={[{ required: true, message: "Silahkan pilih Tahun Ajaran" }]}
    >
      <Select
        placeholder="Pilih Tahun Ajaran"
        onChange={(value) => handleTahunAjaranChange(value, form)}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
      >
        {filterState.tahunAjaranList.map(({ idTahun, tahunAjaran }) => (
          <Select.Option key={idTahun} value={idTahun}>
            {tahunAjaran}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderSemesterSelect = (form) => (
    <Form.Item
      label="Semester"
      name="idSemester"
      rules={[{ required: true, message: "Silahkan pilih Semester" }]}
    >
      <Select
        placeholder="Pilih Semester"
        onChange={(value) => handleSemesterChange(value, form)}
        value={filterState.selectedSemester}
        disabled={
          !filterState.selectedTahunAjaran ||
          filterState.availableSemesters.length === 0
        }
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
      >
        {filterState.availableSemesters.map(({ idSemester, namaSemester }) => (
          <Select.Option key={idSemester} value={idSemester}>
            {namaSemester}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderKelasSelect = (form) => (
    <Form.Item
      label="Kelas"
      name="idKelas"
      rules={[{ required: true, message: "Silahkan pilih Kelas" }]}
    >
      <Select
        placeholder="Pilih Kelas"
        onChange={(value) => handleKelasChange(value, form)}
        value={filterState.selectedKelas}
        disabled={
          !filterState.selectedSemester ||
          filterState.availableKelas.length === 0
        }
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
      >
        {filterState.availableKelas.map(({ idKelas, namaKelas }) => (
          <Select.Option key={idKelas} value={idKelas}>
            {namaKelas}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderMapelSelect = (form) => (
    <Form.Item
      label="Mapel"
      name="idMapel"
      rules={[{ required: true, message: "Silahkan pilih Mapel" }]}
    >
      <Select
        placeholder="Pilih Mapel"
        onChange={(value) => handleMapelChange(value, form)}
        value={filterState.selectedMapel}
        disabled={
          !filterState.selectedKelas || filterState.availableMapels.length === 0
        }
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
      >
        {filterState.availableMapels.map(({ idMapel, name }) => (
          <Select.Option key={idMapel} value={idMapel}>
            {name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderElemenSelect = (form) => (
    <Form.Item
      label="Elemen"
      name="idElemen"
      rules={[{ required: true, message: "Silahkan pilih Elemen" }]}
    >
      <Select
        placeholder="Pilih Elemen"
        onChange={(value) => handleElemenChange(value, form)}
        value={filterState.selectedElemen}
        disabled={
          !filterState.selectedMapel || filterState.availableElemen.length === 0
        }
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
      >
        {filterState.availableElemen.map(({ idElemen, namaElemen }) => (
          <Select.Option key={idElemen} value={idElemen}>
            {namaElemen}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const rendeAcpSelect = (form) => (
    <Form.Item
      label="Analisis Capaian Pembelajaran"
      name="idAcp"
      rules={[{ required: true, message: "Silahkan pilih ACP" }]}
    >
      <Select
        placeholder="Pilih Analisis Capaian Pembelajaran"
        disabled={
          !filterState.selectedElemen || filterState.availableAcp.length === 0
        }
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
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
    rendeAcpSelect,
    getAvailableSemesters,
    getAvailableKelas,
    getAvailableMapels,
    getAvailableElemens,
    getAvailableAcp,
  };
};
