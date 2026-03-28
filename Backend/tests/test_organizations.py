from app import schemas


def test_unauthorized_get_organization(client,test_organizations):
    res =client.get('/organizations')
    assert res.status_code == 401


def test_get_organizations(authorized_client, test_organizations):
    res = authorized_client.get("/organizations/?limit=10&page=1")

    assert res.status_code == 200

    payload = schemas.OrganizationPaginatedResponse(**res.json())
    assert payload.total == len(test_organizations)
    assert payload.page == 1
    assert len(payload.data) == len(test_organizations)


def test_get_organizations_limit_and_page(authorized_client, test_organizations):
    # limit=2, page=1 => 2 orgs
    res = authorized_client.get("/organizations/?limit=2&page=1")
    assert res.status_code == 200
    payload = schemas.OrganizationPaginatedResponse(**res.json())
    assert payload.page == 1
    assert len(payload.data) == 2

    # limit=2, page=2 => remaining org(s)
    res2 = authorized_client.get("/organizations/?limit=2&page=2")
    assert res2.status_code == 200
    payload2 = schemas.OrganizationPaginatedResponse(**res2.json())
    assert payload2.page == 2
    assert len(payload2.data) == max(0, len(test_organizations) - 2)


def test_search_organizations(authorized_client, test_organizations):
    res = authorized_client.get("/organizations/?search=Another&limit=10&page=1")
    assert res.status_code == 200

    payload = schemas.OrganizationPaginatedResponse(**res.json())
    assert payload.total == 1
    assert len(payload.data) == 1
    assert "Another" in payload.data[0].name

def test_get_organization_by_id(authorized_client, test_organizations):
    org_id = test_organizations[0].id

    res = authorized_client.get(f"/organizations/{org_id}")
    assert res.status_code == 200

    org = schemas.OrganizationResponse(**res.json())
    assert org.id == org_id
    assert org.name == test_organizations[0].name


def test_get_organization_not_found(authorized_client):
    res = authorized_client.get("/organizations/999999")
    assert res.status_code == 404


def test_create_organization(authorized_client):
    payload = {
        "name": "Created Org",
        "status": "active",
        "description": "Created via test",
    }

    res = authorized_client.post("/organizations/", json=payload)
    assert res.status_code == 201

    org = schemas.OrganizationResponse(**res.json())
    assert org.name == payload["name"]
    assert org.status == payload["status"]
    assert org.description == payload["description"]


def test_patch_organization(authorized_client, test_organizations):
    org_id = test_organizations[0].id

    patch_payload = {"status": "inactive"}
    res = authorized_client.patch(f"/organizations/{org_id}", json=patch_payload)

    assert res.status_code == 202
    org = schemas.OrganizationResponse(**res.json())
    assert org.id == org_id
    assert org.status == "inactive"


def test_put_organization(authorized_client, test_organizations):
    org_id = test_organizations[0].id

    put_payload = {
        "name": "Org Renamed",
        "status": "active",
        "description": "Updated via PUT",
    }
    res = authorized_client.put(f"/organizations/{org_id}", json=put_payload)

    assert res.status_code == 200
    org = schemas.OrganizationResponse(**res.json())
    assert org.id == org_id
    assert org.name == put_payload["name"]
    assert org.status == put_payload["status"]
    assert org.description == put_payload["description"]


def test_delete_organization(authorized_client, test_organizations):
    org_id = test_organizations[0].id

    res = authorized_client.delete(f"/organizations/{org_id}")
    assert res.status_code == 204

    res_get = authorized_client.get(f"/organizations/{org_id}")
    assert res_get.status_code == 404