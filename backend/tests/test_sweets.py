import pytest
from fastapi import status

class TestCreateSweet:
    """Test cases for creating sweets"""
    
    def test_create_sweet_success(self, client, user_token):
        """Test successful sweet creation"""
        response = client.post(
            "/api/sweets",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "name": "Candy Cane",
                "category": "Hard Candy",
                "price": 1.99,
                "quantity": 150,
                "description": "Peppermint flavored"
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Candy Cane"
        assert data["category"] == "Hard Candy"
        assert data["price"] == 1.99
        assert data["quantity"] == 150
        assert "id" in data
    
    def test_create_sweet_without_auth(self, client):
        """Test creating sweet without authentication fails"""
        response = client.post(
            "/api/sweets",
            json={
                "name": "Candy Cane",
                "category": "Hard Candy",
                "price": 1.99,
                "quantity": 150
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_sweet_invalid_price(self, client, user_token):
        """Test creating sweet with negative price fails"""
        response = client.post(
            "/api/sweets",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "name": "Candy Cane",
                "category": "Hard Candy",
                "price": -1.99,
                "quantity": 150
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_create_sweet_invalid_quantity(self, client, user_token):
        """Test creating sweet with negative quantity fails"""
        response = client.post(
            "/api/sweets",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "name": "Candy Cane",
                "category": "Hard Candy",
                "price": 1.99,
                "quantity": -10
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGetSweets:
    """Test cases for retrieving sweets"""
    
    def test_get_all_sweets(self, client, user_token, multiple_sweets):
        """Test getting all sweets"""
        response = client.get(
            "/api/sweets",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 4
        assert all("id" in sweet for sweet in data)
    
    def test_get_all_sweets_empty(self, client, user_token):
        """Test getting sweets when none exist"""
        response = client.get(
            "/api/sweets",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    def test_get_all_sweets_without_auth(self, client):
        """Test getting sweets without authentication fails"""
        response = client.get("/api/sweets")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_sweet_by_id(self, client, user_token, test_sweet):
        """Test getting a specific sweet by ID"""
        response = client.get(
            f"/api/sweets/{test_sweet.id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_sweet.id
        assert data["name"] == "Chocolate Bar"
    
    def test_get_nonexistent_sweet(self, client, user_token):
        """Test getting non-existent sweet returns 404"""
        response = client.get(
            "/api/sweets/9999",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestSearchSweets:
    """Test cases for searching sweets"""
    
    def test_search_by_name(self, client, user_token, multiple_sweets):
        """Test searching sweets by name"""
        response = client.get(
            "/api/sweets/search?name=Gummy",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert "Gummy" in data[0]["name"]
    
    def test_search_by_category(self, client, user_token, multiple_sweets):
        """Test searching sweets by category"""
        response = client.get(
            "/api/sweets/search?category=Gummies",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert all(sweet["category"] == "Gummies" for sweet in data)
    
    def test_search_by_price_range(self, client, user_token, multiple_sweets):
        """Test searching sweets by price range"""
        response = client.get(
            "/api/sweets/search?min_price=2.00&max_price=4.00",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(2.00 <= sweet["price"] <= 4.00 for sweet in data)
    
    def test_search_combined_filters(self, client, user_token, multiple_sweets):
        """Test searching with multiple filters"""
        response = client.get(
            "/api/sweets/search?category=Chocolate&min_price=3.00",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Dark Chocolate"


class TestUpdateSweet:
    """Test cases for updating sweets"""
    
    def test_update_sweet_success(self, client, user_token, test_sweet):
        """Test successful sweet update"""
        response = client.put(
            f"/api/sweets/{test_sweet.id}",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"price": 3.50, "quantity": 150}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["price"] == 3.50
        assert data["quantity"] == 150
        assert data["name"] == "Chocolate Bar"  # Unchanged
    
    def test_update_sweet_partial(self, client, user_token, test_sweet):
        """Test partial sweet update"""
        response = client.put(
            f"/api/sweets/{test_sweet.id}",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"name": "Premium Chocolate Bar"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Premium Chocolate Bar"
        assert data["price"] == 2.50  # Unchanged
    
    def test_update_nonexistent_sweet(self, client, user_token):
        """Test updating non-existent sweet returns 404"""
        response = client.put(
            "/api/sweets/9999",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"price": 5.00}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_update_sweet_without_auth(self, client, test_sweet):
        """Test updating sweet without authentication fails"""
        response = client.put(
            f"/api/sweets/{test_sweet.id}",
            json={"price": 3.50}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDeleteSweet:
    """Test cases for deleting sweets (admin only)"""
    
    def test_delete_sweet_as_admin(self, client, admin_token, test_sweet):
        """Test admin can delete sweet"""
        response = client.delete(
            f"/api/sweets/{test_sweet.id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify sweet is deleted
        get_response = client.get(
            f"/api/sweets/{test_sweet.id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_sweet_as_regular_user(self, client, user_token, test_sweet):
        """Test regular user cannot delete sweet"""
        response = client.delete(
            f"/api/sweets/{test_sweet.id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_delete_nonexistent_sweet(self, client, admin_token):
        """Test deleting non-existent sweet returns 404"""
        response = client.delete(
            "/api/sweets/9999",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestPurchaseSweet:
    """Test cases for purchasing sweets"""
    
    def test_purchase_sweet_success(self, client, user_token, test_sweet):
        """Test successful sweet purchase"""
        initial_quantity = test_sweet.quantity
        response = client.post(
            f"/api/sweets/{test_sweet.id}/purchase",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"quantity": 10}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["quantity"] == initial_quantity - 10
    
    def test_purchase_sweet_insufficient_stock(self, client, user_token, test_sweet):
        """Test purchasing more than available stock fails"""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/purchase",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"quantity": 1000}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Not enough stock" in response.json()["detail"]
    
    def test_purchase_nonexistent_sweet(self, client, user_token):
        """Test purchasing non-existent sweet returns 404"""
        response = client.post(
            "/api/sweets/9999/purchase",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"quantity": 5}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_purchase_invalid_quantity(self, client, user_token, test_sweet):
        """Test purchasing with invalid quantity fails"""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/purchase",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"quantity": 0}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestRestockSweet:
    """Test cases for restocking sweets (admin only)"""
    
    def test_restock_sweet_as_admin(self, client, admin_token, test_sweet):
        """Test admin can restock sweet"""
        initial_quantity = test_sweet.quantity
        response = client.post(
            f"/api/sweets/{test_sweet.id}/restock",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"quantity": 50}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["quantity"] == initial_quantity + 50
    
    def test_restock_sweet_as_regular_user(self, client, user_token, test_sweet):
        """Test regular user cannot restock sweet"""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/restock",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"quantity": 50}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_restock_nonexistent_sweet(self, client, admin_token):
        """Test restocking non-existent sweet returns 404"""
        response = client.post(
            "/api/sweets/9999/restock",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"quantity": 50}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_restock_invalid_quantity(self, client, admin_token, test_sweet):
        """Test restocking with invalid quantity fails"""
        response = client.post(
            f"/api/sweets/{test_sweet.id}/restock",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"quantity": 0}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY