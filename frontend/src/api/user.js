import request from "@/utils/request";

export function reqUserInfo(data) {
  return request({
    url: "/user/me",
    method: "get",
    data,
  });
}

export function getUsers() {
  return request({
    url: "/users",
    method: "get",
  });
}

export function getUsersNotUsedInLectures() {
  return request({
    url: "/users/not-used-account",
    method: "get",
  });
}

export function deleteUser(data) {
  return request({
    url: "/user/delete",
    method: "post",
    data,
  });
}

export function editUser(data) {
  return request({
    url: "/user/edit",
    method: "post",
    data,
  });
}

export function reqValidatUserID(data) {
  return request({
    url: "/user/validatUserID",
    method: "post",
    data,
  });
}

export function addUser(data) {
  return request({
    url: "/auth/signup",
    method: "post",
    data,
  });
}

export function getUserById(userId) {
  return request({
    url: `/users/${userId}`,
    method: "get",
  });
}
