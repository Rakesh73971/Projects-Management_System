import { apiRequest } from "../lib/api";

const ORGANIZATIONS_PATH = "/organizations";
const MEMBERS_PATH = "/organizationmembers";

export const getOrganizations = async ({ limit = 100, page = 1, search = "", sort_by = "id", order = "asc" } = {}) => {
  const query = new URLSearchParams({ limit, page, search, sort_by, order });
  const result = await apiRequest(`${ORGANIZATIONS_PATH}/?${query.toString()}`);
  return result.data ?? [];
};

export const getOrganization = async (id) => {
  return apiRequest(`${ORGANIZATIONS_PATH}/${id}`);
};

export const createOrganization = async (payload) => {
  return apiRequest(ORGANIZATIONS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getOrganizationMembers = async () => {
  const result = await apiRequest(MEMBERS_PATH);
  return result ?? [];
};
