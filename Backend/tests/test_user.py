from app import schemas
from app.config import settings
from jose import jwt


def test_create_user(client):
    res = client.post(
        "/users/",
        json={
            "name": "Rakesh",
            "email": "hello123@gmail.com",
            "password": "password123",
            'designation':'Python Developer',
            'tech_stack':'Python,FastAPI,Django,Postgresql,MongoDB'
        },
    )

    assert res.status_code == 201
    new_user = schemas.UserResponse(**res.json())
    assert new_user.email == "hello123@gmail.com"


def test_get_user_by_id(client, test_user):
    user_id = test_user["id"]

    res = client.get(f"/users/{user_id}")

    assert res.status_code == 200
    user = schemas.UserResponse(**res.json())
    assert user.id == user_id
    assert user.email == test_user["email"]


def test_get_user_not_found(client):
    res = client.get("/users/999999")

    assert res.status_code == 404


def test_token_contains_correct_user_id(token, test_user):
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    assert payload.get("user_id") == test_user["id"]