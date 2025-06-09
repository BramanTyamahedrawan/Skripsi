import request from "@/utils/request";

export function addBankSoal(data) {
  return request({
    url: "/bankSoal",
    method: "post",
    data,
  });
}

export function getBankSoal() {
  return request({
    url: "/bankSoal",
    method: "get",
  });
}

export function deleteBankSoal(data) {
  return request({
    url: `/bankSoal/${data.idBankSoal}`,
    method: "delete",
    data,
  });
}
