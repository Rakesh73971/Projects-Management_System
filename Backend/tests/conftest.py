from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.oauth2 import create_access_token
from app.database import get_db
from app.database import Base
from app import models
import pytest



SQLALCHEMY_DATABASE_URL = f"postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False,expire_on_commit=False)


Base.metadata.create_all(bind=engine)



@pytest.fixture()
def session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db=TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()



@pytest.fixture()
def client(session):
    def override_get_db():
        try:
            yield session
        finally:
            session.close()
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)

@pytest.fixture
def test_user2(client):
    user_data = {
        "name": "Sanjeev",
        "email": "sanjeev123@gmail.com",
        "password": "password123",
        'designation':'python developer',
        'tech_stack':'python,FastAPI,Django,MySQL'
    }
    res = client.post("/users/", json=user_data)

    assert res.status_code == 201

    new_user = res.json()
    new_user['password'] = user_data['password']
    return new_user

@pytest.fixture
def test_user(client):
    user_data = {
        "name": "Rakesh",
        "email": "rakesh@gmail.com",
        "password": "password123",
        'designation':'Java Developer',
        'tech_stack':'java,spring,springboot,postgresql'
    }
    res = client.post("/users/", json=user_data)
    assert res.status_code == 201
    print(res.json())
    new_user = res.json()
    new_user['password'] = user_data['password']
    return new_user


@pytest.fixture
def token(test_user):
    return create_access_token({"user_id":test_user['id']})

@pytest.fixture
def authorized_client(client,token):
    client.headers = {
        **client.headers,
        'Authorization':f'Bearer {token}'
    }
    return client


@pytest.fixture
def test_organization(session):
    org = models.Organization(
        name="Fixture Org",
        status="active",
        description="Org from fixture",
    )
    session.add(org)
    session.commit()
    session.refresh(org)
    return org


@pytest.fixture
def test_members(test_user, test_user2, test_organization, session):
    members_data = [
        {"user_id": test_user["id"], "organization_id": test_organization.id, "role": "member"},
        {"user_id": test_user2["id"], "organization_id": test_organization.id, "role": "admin"},
    ]

    members = [models.OrganizationMember(**m) for m in members_data]
    session.add_all(members)
    session.commit()

    return session.query(models.OrganizationMember).all()


@pytest.fixture
def test_organizations(session):
    orgs_data = [
        {"name": "Org One", "status": "active", "description": "Org 1"},
        {"name": "Org Two", "status": "inactive", "description": "Org 2"},
        {"name": "Another Org", "status": "active", "description": "Org 3"},
    ]

    orgs = [models.Organization(**o) for o in orgs_data]
    session.add_all(orgs)
    session.commit()

    return session.query(models.Organization).order_by(models.Organization.id.asc()).all()

