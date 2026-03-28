from app import schemas


def test_get_all_members(authorized_client, test_members):
    res = authorized_client.get("/organizationmembers/")

    def validate(item):
        return schemas.OrganizationMemberResponse(**item)

    members_list = list(map(validate, res.json()))

    assert res.status_code == 200
    assert len(members_list) == len(test_members)


def test_unauthorized_get_all_members(client, test_members):
    res = client.get("/organizationmembers/")
    assert res.status_code == 401


def test_unauthorized_get_one_member(client, test_members):
    res = client.get(f"/organizationmembers/{test_members[0].id}")
    assert res.status_code == 401


def test_get_one_member_not_exist(authorized_client, test_members):
    res = authorized_client.get("/organizationmembers/999999")
    assert res.status_code == 404


def test_get_one_member(authorized_client, test_members):
    res = authorized_client.get(f"/organizationmembers/{test_members[0].id}")

    assert res.status_code == 200
    member = schemas.OrganizationMemberResponse(**res.json())
    assert member.id == test_members[0].id
    assert member.user_id == test_members[0].user_id
    assert member.organization_id == test_members[0].organization_id
    assert member.role == test_members[0].role


def test_create_member(authorized_client, test_user, test_organization):
    payload = {
        "user_id": test_user["id"],
        "organization_id": test_organization.id,
        "role": "admin",
    }

    res = authorized_client.post("/organizationmembers/", json=payload)

    assert res.status_code == 201
    member = schemas.OrganizationMemberResponse(**res.json())
    assert member.user_id == payload["user_id"]
    assert member.organization_id == payload["organization_id"]
    assert member.role == payload["role"]


def test_unauthorized_create_member(client, test_user, test_organization):
    payload = {
        "user_id": test_user["id"],
        "organization_id": test_organization.id,
        "role": "member",
    }

    res = client.post("/organizationmembers/", json=payload)
    assert res.status_code == 401


def test_partial_update_member(authorized_client, test_members):
    member_id = test_members[0].id

    payload = {"role": "admin"}
    res = authorized_client.patch(f"/organizationmembers/{member_id}", json=payload)

    assert res.status_code == 202
    updated = schemas.OrganizationMemberResponse(**res.json())
    assert updated.role == "admin"


def test_full_update_member(authorized_client, test_members, test_organization):
    member_id = test_members[0].id

    payload = {
        "user_id": test_members[0].user_id,
        "organization_id": test_organization.id,
        "role": "admin",
    }

    res = authorized_client.put(f"/organizationmembers/{member_id}", json=payload)

    assert res.status_code == 200
    updated = schemas.OrganizationMemberResponse(**res.json())
    assert updated.user_id == payload["user_id"]
    assert updated.organization_id == payload["organization_id"]
    assert updated.role == payload["role"]


def test_delete_member(authorized_client, test_members):
    member_id = test_members[0].id

    res = authorized_client.delete(f"/organizationmembers/{member_id}")
    assert res.status_code == 204

    res_get = authorized_client.get(f"/organizationmembers/{member_id}")
    assert res_get.status_code == 404