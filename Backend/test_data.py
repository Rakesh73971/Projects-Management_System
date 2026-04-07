"""
Test data creation script - Run this to populate test users
Python: python test_data.py
"""

import requests
import json

API_URL = "http://localhost:8000"

# Test users to create
TEST_USERS = [
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "designation": "Software Engineer",
        "tech_stack": "Python, FastAPI, React"
    },
    {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "password": "password123",
        "designation": "Product Manager",
        "tech_stack": "Product Management"
    },
    {
        "name": "Bob Wilson",
        "email": "bob@example.com",
        "password": "password123",
        "designation": "DevOps Engineer",
        "tech_stack": "Docker, Kubernetes, AWS"
    }
]

def create_test_users():
    """Create test users in the database"""
    print("Creating test users...")
    
    for user in TEST_USERS:
        try:
            response = requests.post(
                f"{API_URL}/users/",
                json=user,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 201:
                print(f"✓ Created user: {user['name']} ({user['email']})")
            elif response.status_code == 422:
                print(f"⚠ User already exists: {user['email']}")
            else:
                print(f"✗ Error creating {user['name']}: {response.status_code}")
                print(f"  Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("✗ Error: Could not connect to API.")
            print("  Make sure the backend server is running on http://localhost:8000")
            return False
        except Exception as e:
            print(f"✗ Error creating user {user['name']}: {str(e)}")
    
    return True

def test_login():
    """Test login with created users"""
    print("\nTesting login...")
    
    # Test with the first user
    test_user = TEST_USERS[0]
    
    try:
        from urllib.parse import urlencode
        
        data = {
            "username": test_user["email"],
            "password": test_user["password"]
        }
        
        response = requests.post(
            f"{API_URL}/login/",
            data=urlencode(data),
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            print(f"✓ Login successful for {test_user['email']}")
            print(f"  Access Token: {token[:20]}...")
            
            # Test getting current user
            headers = {"Authorization": f"Bearer {token}"}
            user_response = requests.get(
                f"{API_URL}/users/me",
                headers=headers
            )
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                print(f"✓ Retrieved user info: {user_data['name']}")
            else:
                print(f"✗ Error retrieving user info: {user_response.status_code}")
        else:
            print(f"✗ Login failed: {response.status_code}")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"✗ Error testing login: {str(e)}")

if __name__ == "__main__":
    print("=" * 50)
    print("TEST DATA CREATION SCRIPT")
    print("=" * 50)
    
    if create_test_users():
        test_login()
    
    print("\n" + "=" * 50)
    print("Test users created!")
    print("Use these credentials to login:")
    for user in TEST_USERS:
        print(f"  Email: {user['email']}")
        print(f"  Password: {user['password']}")
    print("=" * 50)
