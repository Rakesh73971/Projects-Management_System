import { apiRequest } from "../lib/api";

const PROJECTS_PATH = "/projects";

export const getProjects = async ({ limit = 100, page = 1, search = "", sort_by = "id", order = "asc" } = {}) => {
  const query = new URLSearchParams({ limit, page, search, sort_by, order });
  const result = await apiRequest(`${PROJECTS_PATH}/?${query.toString()}`);
  return result.data ?? [];
};

export const getProject = async (id) => {
  return apiRequest(`${PROJECTS_PATH}/${id}`);
};

export const createProject = async (payload) => {
  return apiRequest(PROJECTS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
