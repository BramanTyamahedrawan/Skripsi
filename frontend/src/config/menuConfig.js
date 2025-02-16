const menuList = [
  {
    title: "Beranda",
    path: "/dashboard",
    icon: "home",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_OPERATOR", "ROLE_TEACHER", "ROLE_DUDI", "ROLE_STUDENT"],
  },
  // {
  //   title: "Author Blog",
  //   path: "/doc",
  //   icon: "file",
  //   roles: ["ROLE_OPERATOR", "ROLE_TEACHER", "ROLE_STUDENT"],
  // },
  // {
  //   title: "Guide",
  //   path: "/guide",
  //   icon: "key",
  //   roles:["ROLE_OPERATOR","ROLE_TEACHER"]
  // },
  // {
  //   title: "Permission",
  //   path: "/permission",
  //   icon: "lock",
  //   children: [
  //     {
  //       title: "Deskripsi Permission",
  //       path: "/permission/explanation",
  //       roles:["ROLE_OPERATOR"]
  //     },
  //     {
  //       title: "Halaman Admin",
  //       path: "/permission/adminPage",
  //       roles:["ROLE_OPERATOR"]
  //     },
  //     {
  //       title: "Halaman Dosen",
  //       path: "/permission/lecturePage",
  //       roles:["ROLE_TEACHER"]
  //     },
  //     {
  //       title: "Halaman Siswa",
  //       path: "/permission/studentPage",
  //       roles:["ROLE_STUDENT"]
  //     },

  //   ],
  // },
  // {
  //   title: "Komponen",
  //   path: "/components",
  //   icon: "appstore",
  //   roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //   children: [
  //     {
  //       title: "Rich Text",
  //       path: "/components/richTextEditor",
  //       roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //     },
  //     {
  //       title: "Markdown",
  //       path: "/components/Markdown",
  //       roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //     },
  //     {
  //       title: "Drag List",
  //       path: "/components/draggable",
  //       roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //     },
  //   ],
  // },
  // {
  //   title: "Bagan",
  //   path: "/charts",
  //   icon: "area-chart",
  //   roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //   children: [
  //     {
  //       title: "Bagan Keyboard",
  //       path: "/charts/keyboard",
  //       roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //     },
  //     {
  //       title: "Bagan Garis",
  //       path: "/charts/line",
  //       roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //     },
  //     {
  //       title: "Bagan Campuran",
  //       path: "/charts/mix-chart",
  //       roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //     },
  //   ],
  // },
  // {
  //   title: "Menu Bersarang",
  //   path: "/nested",
  //   icon: "cluster",
  //   roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //   children: [
  //     {
  //       title: "Menu 1",
  //       path: "/nested/menu1",
  //       children: [
  //         {
  //           title: "Menu 1-1",
  //           path: "/nested/menu1/menu1-1",
  //           roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //         },
  //         {
  //           title: "Menu 1-2",
  //           path: "/nested/menu1/menu1-2",
  //           children: [
  //             {
  //               title: "Menu 1-2-1",
  //               path: "/nested/menu1/menu1-2/menu1-2-1",
  //               roles:["ROLE_OPERATOR","ROLE_TEACHER"],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   title: "Tabel",
  //   path: "/table",
  //   icon: "table",
  //   roles:["ROLE_OPERATOR","ROLE_TEACHER"]
  // },
  // {
  //   title: "Excel",
  //   path: "/excel",
  //   icon: "file-excel",
  //   roles: ["ROLE_OPERATOR", "ROLE_TEACHER"],
  //   children: [
  //     {
  //       title: "Export Excel",
  //       path: "/excel/export",
  //       roles: ["ROLE_OPERATOR", "ROLE_TEACHER"],
  //     },
  //     {
  //       title: "Export Excel",
  //       path: "/excel/upload",
  //       roles: ["ROLE_OPERATOR", "ROLE_TEACHER"],
  //     },
  //   ],
  // },
  // {
  //   title: "Zip",
  //   path: "/zip",
  //   icon: "file-zip",
  //   roles: ["ROLE_OPERATOR", "ROLE_TEACHER"],
  // },
  // {
  //   title: "Papan Klip",
  //   path: "/clipboard",
  //   icon: "copy",
  //   roles:["ROLE_OPERATOR","ROLE_TEACHER"]
  // },
  // Admin
  {
    title: "Master Data",
    path: "/master",
    icon: "database",
    roles: ["ROLE_ADMINISTRATOR" , "ROLE_OPERATOR"],
    children: [
      {
        title: "Bidang Keahlian",
        path: "/bidang-keahlian",
        icon: "apartment",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Program Keahlian",
        path: "/program-keahlian",
        icon: "apartment",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Konsentrasi Keahlian",
        path: "/konsentrasi-keahlian",
        icon: "apartment",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Jurusan",
        path: "/department",
        icon: "apartment",
        roles: [ "ROLE_OPERATOR"],
      },
      {
        title: "Prodi",
        path: "/study-program",
        icon: "appstore",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Agama",
        path: "/religion",
        icon: "global",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Kurikulum",
        path: "/kurikulum",
        icon: "branches",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Mata Pelajaran",
        path: "/subject",
        icon: "audit",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Jadwal Pelajaran",
        path: "/jadwal-pelajaran",
        icon: "branches",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Kelas",
        path: "/kelas",
        icon: "audit",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Tahun Ajaran",
        path: "/tahun-ajaran",
        icon: "audit",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Kelas Ajaran",
        path: "/season",
        icon: "audit",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Analisis Capaian Pembelajaran",
        path: "/acp",
        icon: "audit",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Alur Tujuan Pembelajaran",
        path: "/atp",
        icon: "audit",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Media Pembelajaran",
        path: "/learning-media",
        icon: "apartment",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Bentuk Pembelajaran",
        path: "/form-learning",
        icon: "container",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Metode Pembelajaran",
        path: "/learning-method",
        icon: "control",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Kriteria Penilaian",
        path: "/assessment-criteria",
        icon: "file-done",
        roles: ["ROLE_OPERATOR"],
      },
      {
        title: "Formulir Penilaian",
        path: "/appraisal-form",
        icon: "file-sync",
        roles: ["ROLE_OPERATOR"],
      },
    ],
  },
  
  {
    title: "Guru",
    path: "/lecture",
    icon: "team",
    roles: ["ROLE_OPERATOR"],
  },

  {
    title: "Siswa",
    path: "/student",
    icon: "team",
    roles: ["ROLE_OPERATOR"],
  },
  {
    title: "List Todo",
    path: "/list-todo-admin",
    icon: "solution",
    roles: ["ROLE_OPERATOR"]
  },
  // Lecture
  {  title: "Master Soal",
    path: "/question",
    icon: "database",
    roles: ["ROLE_TEACHER", "ROLE_DUDI", "ROLE_OPERATOR"],
    children: [
      {
        title: "Kriteria Pertanyaan",
        path: "/question-criteria",
        icon: "apartment",
        roles: ["ROLE_TEACHER", "ROLE_DUDI", "ROLE_OPERATOR"],
      },
      {
        title: "Tabel Nilai Linguistik",
        path: "/linguistic-value",
        icon: "file-text",
        roles: ["ROLE_TEACHER", "ROLE_DUDI", "ROLE_OPERATOR"],
      },
      {
        title : "Pengujian Soal",
        path : "/criteria-value",
        icon : "file-search",
        // roles : ["ROLE_OPERATOR"],
        roles : ["ROLE_TEACHER", "ROLE_DUDI", "ROLE_OPERATOR"],
      },
    ],
  },
  {
    title: "List Todo",
    path: "/list-todo",
    icon: "solution",
    roles: ["ROLE_TEACHER", "ROLE_DUDI",]
  },
  {
    title: "Pengguna",
    path: "/user",
    icon: "usergroup-add",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_OPERATOR"],
  },

  {
    title: "Profil Sekolah",
    path: "/school-profile",
    icon: "apartment",
    roles: ["ROLE_ADMINISTRATOR"],
  },

  {
    title: "RPS",
    path: "/rps",
    icon: "radar-chart",
    roles: ["ROLE_TEACHER", "ROLE_DUDI", "ROLE_OPERATOR"],
  },
  {
    title: "Manajemen Soal",
    path: "/question",
    icon: "file-search",
    roles: ["ROLE_OPERATOR", "ROLE_DUDI", "ROLE_TEACHER"],
  },
  {
    title: "Setting Ujian",
    path: "/setting-exam",
    icon: "solution",
    roles: ["ROLE_OPERATOR"],
  },
  {
    title: "Setting Kuis",
    path: "/setting-quiz",
    icon: "solution",
    roles: ["ROLE_TEACHER", "ROLE_DUDI", "ROLE_OPERATOR"],
  },
  {
    title: "Setting Latihan",
    path: "/setting-exercise",
    icon: "solution",
    roles: ["ROLE_TEACHER", "ROLE_DUDI", "ROLE_OPERATOR"],
  },
  {
    title: "Ujian",
    path: "/exam",
    icon: "solution",
    roles: ["ROLE_STUDENT"],
  },
  {
    title: "Kuis",
    path: "/quiz",
    icon: "solution",
    roles: ["ROLE_STUDENT"],
  },
  {
    title: "Latihan",
    path: "/exercise",
    icon: "solution",
    roles: ["ROLE_STUDENT"],
  },
  {
    title: "Nilai",
    path: "/result",
    icon: "file-protect",
    roles: ["ROLE_TEACHER",  "ROLE_DUDI"],
    children: [
      {
        title: "Nilai Ujian",
        path: "/result/exam",
        roles: ["ROLE_TEACHER",  "ROLE_DUDI",],
      },
      {
        title: "Nilai Kuis",
        path: "/result/quiz",
        roles: [ "ROLE_DUDI", "ROLE_TEACHER"],
      },
      {
        title: "Nilai Latihan",
        path: "/result/exercise",
        roles: [ "ROLE_DUDI", "ROLE_TEACHER"],
      },
    ],
  },
  {
    title: "Tentang Penulis",
    path: "/about",
    icon: "copyright",
    roles: ["ROLE_OPERATOR", "ROLE_DUDI", "ROLE_TEACHER", "ROLE_STUDENT"],
  },

  // {
  //   title: "Bug收集",
  //   path: "/bug",
  //   icon: "bug",
  //   roles:["ROLE_OPERATOR"]
  // },
];
export default menuList;
