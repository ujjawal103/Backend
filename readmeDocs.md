# Admin API Documentation

Simple documentation with examples for all admin routes.

## 1. Register Admin

**Endpoint:** `POST /register`  
**Auth Required:** No

### Request Example
```json
{
    "fullName": {
        "firstName": "John",
        "lastName": "Doe"
    },
    "email": "john@example.com",
    "password": "secure123"
}
```

### Success Response
**Code:** 201 CREATED
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
        "_id": "65217a8b9d3f1234567890",
        "fullName": {
            "firstName": "John",
            "lastName": "Doe"
        },
        "email": "john@example.com",
        "socketId": null,
        "role": "superadmin",
        "stores": [],
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When validation fails*
```json
{
    "errors": [
        {
            "msg": "Invalid Email",
            "param": "email",
            "location": "body"
        }
    ]
}
```

**Code:** 400 BAD REQUEST  
*When admin already exists*
```json
{
    "message": "Admin already exists"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 2. Login Admin

**Endpoint:** `POST /login`  
**Auth Required:** No

### Request Example
```json
{
    "email": "john@example.com",
    "password": "secure123"
}
```

### Success Response
**Code:** 200 OK  
**Headers:** Sets cookie `token=<jwt-token>`
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
        "_id": "65217a8b9d3f1234567890",
        "fullName": {
            "firstName": "John",
            "lastName": "Doe"
        },
        "email": "john@example.com",
        "socketId": null,
        "role": "superadmin",
        "stores": [],
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When validation fails*
```json
{
    "errors": [
        {
            "msg": "Password should be of at least 6 characters",
            "param": "password",
            "location": "body"
        }
    ]
}
```

**Code:** 401 UNAUTHORIZED  
*When credentials are invalid*
```json
{
    "message": "Invalid Email or Password"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 3. Get Admin Profile

**Endpoint:** `GET /profile`  
**Auth Required:** Yes (token via cookie or Authorization header)

### Request Headers
```
Authorization: Bearer <jwt-token>
```
or
```
Cookie: token=<jwt-token>
```

### Success Response
**Code:** 200 OK
```json
{
    "admin": {
        "_id": "65217a8b9d3f1234567890",
        "fullName": {
            "firstName": "John",
            "lastName": "Doe"
        },
        "email": "john@example.com",
        "socketId": null,
        "role": "superadmin",
        "stores": [],
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 401 UNAUTHORIZED  
*When token is missing*
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 401 UNAUTHORIZED  
*When token is invalid/expired*
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 4. Logout Admin

**Endpoint:** `GET /logout`  
**Auth Required:** Yes (token via cookie or Authorization header)

### Request Headers
```
Authorization: Bearer <jwt-token>
```
or
```
Cookie: token=<jwt-token>
```

### Success Response
**Code:** 200 OK
```json
{
    "message": "Logged out successfully"
}
```

### Error Responses

**Code:** 401 UNAUTHORIZED  
*When token is missing*
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 500 INTERNAL SERVER ERROR  
*When blacklisting token fails*
```json
{
    "message": "Internal Server Error"
}
```

---

## Test with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/admin/register \
-H "Content-Type: application/json" \
-d '{
    "fullName": {
        "firstName": "John",
        "lastName": "Doe"
    },
    "email": "john@example.com",
    "password": "secure123"
}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
-H "Content-Type: application/json" \
-d '{
    "email": "john@example.com",
    "password": "secure123"
}'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/admin/profile \
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Logout
```bash
curl -X GET http://localhost:3000/api/admin/logout \
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

# Store API Documentation

Simple documentation with examples for all store routes.

## 1. Register Store

**Endpoint:** `POST /register`  
**Auth Required:** Yes (Admin token required)

### Request Example
```json
{
    "storeName": "Coffee House",
    "email": "coffee@example.com",
    "password": "secure123",
    "storeDetails": {
        "photo": "/store.png",
        "address": "123 Coffee Street, Cafe Area, City, 12345",
        "phoneNumber": "1234567890"
    },
    "gstSettings": {
        "gstApplicable": true,
        "gstRate": 0.05,
        "restaurantChargeApplicable": true,
        "restaurantCharge": 10
    }
}
```

### Success Response
**Code:** 201 CREATED
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "store": {
        "_id": "65217a8b9d3f1234567890",
        "storeName": "Coffee House",
        "email": "coffee@example.com",
        "status": "open",
        "storeDetails": {
            "photo": "/store.png",
            "address": "123 Coffee Street, Cafe Area, City, 12345",
            "phoneNumber": "1234567890"
        },
        "gstSettings": {
            "gstApplicable": true,
            "gstRate": 0.05,
            "restaurantChargeApplicable": true,
            "restaurantCharge": 10
        },
        "items": [],
        "tables": [],
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When validation fails*
```json
{
    "errors": [
        {
            "msg": "Store name is required",
            "param": "storeName",
            "location": "body"
        }
    ]
}
```

**Code:** 400 BAD REQUEST  
*When store already exists*
```json
{
    "message": "Store already exists"
}
```

**Code:** 401 UNAUTHORIZED  
*When admin token is missing or invalid*
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 2. Login Store

**Endpoint:** `POST /login`  
**Auth Required:** No

### Request Example
```json
{
    "email": "coffee@example.com",
    "password": "secure123"
}
```

### Success Response
**Code:** 200 OK  
**Headers:** Sets cookie `token=<jwt-token>`
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "store": {
        "_id": "65217a8b9d3f1234567890",
        "storeName": "Coffee House",
        "email": "coffee@example.com",
        "status": "open",
        "storeDetails": {
            "photo": "/store.png",
            "address": "123 Coffee Street, Cafe Area, City, 12345",
            "phoneNumber": "1234567890"
        },
        "gstSettings": {
            "gstApplicable": true,
            "gstRate": 0.05,
            "restaurantChargeApplicable": true,
            "restaurantCharge": 10
        },
        "items": [],
        "tables": [],
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When validation fails*
```json
{
    "errors": [
        {
            "msg": "Password should be at least 6 characters long",
            "param": "password",
            "location": "body"
        }
    ]
}
```

**Code:** 401 UNAUTHORIZED  
*When credentials are invalid*
```json
{
    "message": "Invalid Email or Password"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 3. Get Store Profile

**Endpoint:** `GET /profile`  
**Auth Required:** Yes (Store token required)

### Request Headers
```
Authorization: Bearer <jwt-token>
```
or
```
Cookie: token=<jwt-token>
```

### Success Response
**Code:** 200 OK
```json
{
    "store": {
        "_id": "65217a8b9d3f1234567890",
        "storeName": "Coffee House",
        "email": "coffee@example.com",
        "status": "open",
        "storeDetails": {
            "photo": "/store.png",
            "address": "123 Coffee Street, Cafe Area, City, 12345",
            "phoneNumber": "1234567890"
        },
        "gstSettings": {
            "gstApplicable": true,
            "gstRate": 0.05,
            "restaurantChargeApplicable": true,
            "restaurantCharge": 10
        },
        "items": [],
        "tables": [],
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 401 UNAUTHORIZED  
*When token is missing*
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 401 UNAUTHORIZED  
*When token is invalid/expired*
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 4. Logout Store

**Endpoint:** `GET /logout`  
**Auth Required:** Yes (Store token required)

### Request Headers
```
Authorization: Bearer <jwt-token>
```
or
```
Cookie: token=<jwt-token>
```

### Success Response
**Code:** 200 OK
```json
{
    "message": "Store logged out successfully"
}
```

### Error Responses

**Code:** 401 UNAUTHORIZED  
*When token is missing*
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 500 INTERNAL SERVER ERROR  
*When blacklisting token fails*
```json
{
    "message": "Internal Server Error"
}
```

---

## Test Store Routes with cURL

### Register Store (Admin token required)
```bash
curl -X POST http://localhost:3000/api/store/register \
-H "Content-Type: application/json" \
-H "Authorization: Bearer ADMIN_TOKEN_HERE" \
-d '{
    "storeName": "Coffee House",
    "email": "coffee@example.com",
    "password": "secure123",
    "storeDetails": {
        "address": "123 Coffee Street, Cafe Area, City, 12345",
        "phoneNumber": "1234567890"
    },
    "gstSettings": {
        "gstApplicable": true,
        "gstRate": 0.05
    }
}'
```

### Login Store
```bash
curl -X POST http://localhost:3000/api/store/login \
-H "Content-Type: application/json" \
-d '{
    "email": "coffee@example.com",
    "password": "secure123"
}'
```

### Get Store Profile
```bash
curl -X GET http://localhost:3000/api/store/profile \
-H "Authorization: Bearer STORE_TOKEN_HERE"
```

### Logout Store
```bash
curl -X GET http://localhost:3000/api/store/logout \
-H "Authorization: Bearer STORE_TOKEN_HERE"
```

# Table API Documentation

Simple documentation with examples for all table routes.

## 1. Add Table

**Endpoint:** `POST /add`  
**Auth Required:** Yes (Store token required)

### Request Example
No request body needed - table number auto-increments

### Success Response
**Code:** 201 CREATED
```json
{
    "message": "Table created",
    "table": {
        "_id": "65217a8b9d3f1234567890",
        "store": "65217a8b9d3f1234567891",
        "tableNumber": 1,
        "qrCode": "https://res.cloudinary.com/.../table_qr.png",
        "qrPublicId": "restaurant/tables/abcd1234",
        "isOccupied": false,
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 401 UNAUTHORIZED  
*When store token is missing/invalid*
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 404 NOT FOUND  
*When store is not found*
```json
{
    "message": "Store not found"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 2. Edit Table

**Endpoint:** `PUT /edit/:tableId`  
**Auth Required:** Yes (Store token required)

### Request Example
```json
{
    "newTableNumber": 5
}
```

### Success Response
**Code:** 200 OK
```json
{
    "message": "Table number updated successfully",
    "table": {
        "_id": "65217a8b9d3f1234567890",
        "store": "65217a8b9d3f1234567891",
        "tableNumber": 5,
        "qrCode": "https://res.cloudinary.com/.../table_qr.png",
        "qrPublicId": "restaurant/tables/abcd1234",
        "isOccupied": false,
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When validation fails*
```json
{
    "errors": [
        {
            "msg": "Table number must be numeric",
            "param": "newTableNumber",
            "location": "body"
        }
    ]
}
```

**Code:** 400 BAD REQUEST  
*When table number already exists*
```json
{
    "message": "Table number already exists in this store"
}
```

**Code:** 404 NOT FOUND  
*When table is not found*
```json
{
    "message": "Table not found"
}
```

**Code:** 401 UNAUTHORIZED
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 3. Remove Table

**Endpoint:** `DELETE /remove/:tableId`  
**Auth Required:** Yes (Store token required)

### Success Response
**Code:** 200 OK
```json
{
    "message": "Table and QR deleted successfully"
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When validation fails*
```json
{
    "errors": [
        {
            "msg": "Invalid Table ID",
            "param": "tableId",
            "location": "params"
        }
    ]
}
```

**Code:** 404 NOT FOUND  
*When table is not found*
```json
{
    "message": "Table not found"
}
```

**Code:** 401 UNAUTHORIZED
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 4. Get Single Table

**Endpoint:** `GET /:tableId`  
**Auth Required:** Yes (Store token required)

### Success Response
**Code:** 200 OK
```json
{
    "table": {
        "_id": "65217a8b9d3f1234567890",
        "store": "65217a8b9d3f1234567891",
        "tableNumber": 5,
        "qrCode": "https://res.cloudinary.com/.../table_qr.png",
        "qrPublicId": "restaurant/tables/abcd1234",
        "isOccupied": false,
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When validation fails*
```json
{
    "errors": [
        {
            "msg": "Invalid Table ID",
            "param": "tableId",
            "location": "params"
        }
    ]
}
```

**Code:** 404 NOT FOUND
```json
{
    "message": "Table not found"
}
```

**Code:** 401 UNAUTHORIZED
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## 5. Get All Tables

**Endpoint:** `GET /`  
**Auth Required:** Yes (Store token required)

### Success Response
**Code:** 200 OK
```json
{
    "count": 2,
    "tables": [
        {
            "_id": "65217a8b9d3f1234567890",
            "store": "65217a8b9d3f1234567891",
            "tableNumber": 1,
            "qrCode": "https://res.cloudinary.com/.../table1_qr.png",
            "qrPublicId": "restaurant/tables/abcd1234",
            "isOccupied": false,
            "createdAt": "2025-10-07T10:00:00.000Z",
            "__v": 0
        },
        {
            "_id": "65217a8b9d3f1234567892",
            "store": "65217a8b9d3f1234567891",
            "tableNumber": 2,
            "qrCode": "https://res.cloudinary.com/.../table2_qr.png",
            "qrPublicId": "restaurant/tables/efgh5678",
            "isOccupied": true,
            "createdAt": "2025-10-07T10:00:00.000Z",
            "__v": 0
        }
    ]
}
```

### Error Responses

**Code:** 401 UNAUTHORIZED
```json
{
    "message": "Unauthorized access"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
    "message": "Internal Server Error"
}
```

---

## Test Table Routes with cURL

### Add Table
```bash
curl -X POST http://localhost:3000/api/table/add \
-H "Authorization: Bearer STORE_TOKEN_HERE"
```

### Edit Table
```bash
curl -X PUT http://localhost:3000/api/table/edit/65217a8b9d3f1234567890 \
-H "Authorization: Bearer STORE_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{
    "newTableNumber": 5
}'
```

### Remove Table
```bash
curl -X DELETE http://localhost:3000/api/table/remove/65217a8b9d3f1234567890 \
-H "Authorization: Bearer STORE_TOKEN_HERE"
```

### Get Single Table
```bash
curl -X GET http://localhost:3000/api/table/65217a8b9d3f1234567890 \
-H "Authorization: Bearer STORE_TOKEN_HERE"
```

### Get All Tables
```bash
curl -X GET http://localhost:3000/api/table \
-H "Authorization: Bearer STORE_TOKEN_HERE"
```

# Item API Documentation

Documentation for all item-related routes including basic CRUD operations and variant management.

## 1. Add Item

**Endpoint:** `POST /add`  
**Auth Required:** Yes (Store token required)

### Request Example
```json
{
    "itemName": "Cappuccino",
    "description": "Italian coffee drink with espresso and steamed milk foam",
    "price": 150
}
```

### Success Response
**Code:** 201 CREATED
```json
{
    "success": true,
    "message": "Item created successfully with default variant",
    "item": {
        "_id": "65217a8b9d3f1234567890",
        "storeId": "65217a8b9d3f1234567891",
        "itemName": "Cappuccino",
        "description": "Italian coffee drink with espresso and steamed milk foam",
        "available": true,
        "image": "/default-item.png",
        "variants": [
            {
                "name": "Full",
                "price": 150,
                "available": true,
                "_id": "65217a8b9d3f1234567892"
            }
        ],
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When validation fails*
```json
{
    "errors": [
        {
            "msg": "Item name is required",
            "param": "itemName",
            "location": "body"
        }
    ]
}
```

**Code:** 400 BAD REQUEST  
*When item already exists*
```json
{
    "message": "Item with this name already exists"
}
```

**Code:** 404 NOT FOUND  
*When store is not found*
```json
{
    "message": "Store not found"
}
```

**Code:** 401 UNAUTHORIZED
```json
{
    "message": "Unauthorized access"
}
```

---

## 2. Edit Item

**Endpoint:** `PUT /edit/:itemId`  
**Auth Required:** Yes (Store token required)

### Request Example
```json
{
    "itemName": "Cappuccino Special",
    "description": "Premium Italian coffee drink"
}
```

### Success Response
**Code:** 200 OK
```json
{
    "message": "Item updated successfully",
    "item": {
        "_id": "65217a8b9d3f1234567890",
        "storeId": "65217a8b9d3f1234567891",
        "itemName": "Cappuccino Special",
        "description": "Premium Italian coffee drink",
        "available": true,
        "image": "/default-item.png",
        "variants": [
            {
                "name": "Full",
                "price": 150,
                "available": true,
                "_id": "65217a8b9d3f1234567892"
            }
        ],
        "createdAt": "2025-10-07T10:00:00.000Z",
        "__v": 0
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When another item has the same name*
```json
{
    "message": "Another item with this name already exists"
}
```

**Code:** 404 NOT FOUND
```json
{
    "message": "Item not found or unauthorized"
}
```

---

## 3. Update Item Availability

**Endpoint:** `PUT /edit/available/:itemId`  
**Auth Required:** Yes (Store token required)

### Request Example
```json
{
    "available": false
}
```

### Success Response
**Code:** 200 OK
```json
{
    "message": "Item and its variants marked as unavailable",
    "item": {
        "_id": "65217a8b9d3f1234567890",
        "storeId": "65217a8b9d3f1234567891",
        "itemName": "Cappuccino Special",
        "available": false,
        "variants": [
            {
                "name": "Full",
                "price": 150,
                "available": false,
                "_id": "65217a8b9d3f1234567892"
            }
        ]
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST
```json
{
    "message": "Available must be true or false"
}
```

**Code:** 404 NOT FOUND
```json
{
    "message": "Item not found"
}
```

---

## 4. Upload Item Image

**Endpoint:** `PUT /upload-image/:itemId`  
**Auth Required:** Yes (Store token required)
**Content-Type:** multipart/form-data

### Request
Form data:
- `image`: Image file

### Success Response
**Code:** 200 OK
```json
{
    "message": "Item image uploaded successfully",
    "item": {
        "_id": "65217a8b9d3f1234567890",
        "image": "https://res.cloudinary.com/.../item.jpg",
        "imagePublicId": "restaurant/items/abc123"
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST
```json
{
    "message": "No image file uploaded"
}
```

**Code:** 404 NOT FOUND
```json
{
    "message": "Item not found"
}
```

---

## 5. Remove Item

**Endpoint:** `DELETE /remove/:itemId`  
**Auth Required:** Yes (Store token required)

### Success Response
**Code:** 200 OK
```json
{
    "message": "Item deleted successfully"
}
```

### Error Responses

**Code:** 404 NOT FOUND
```json
{
    "message": "Item not found"
}
```

---

## 6. Get All Items

**Endpoint:** `GET /store-items` (for store) or `GET /menu/:storeId` (public)  
**Auth Required:** Yes for /store-items, No for /menu/:storeId

### Success Response
**Code:** 200 OK
```json
{
    "count": 2,
    "items": [
        {
            "_id": "65217a8b9d3f1234567890",
            "storeId": "65217a8b9d3f1234567891",
            "itemName": "Cappuccino",
            "description": "Italian coffee drink",
            "available": true,
            "image": "https://res.cloudinary.com/.../cappuccino.jpg",
            "variants": [
                {
                    "name": "Small",
                    "price": 120,
                    "available": true
                },
                {
                    "name": "Large",
                    "price": 180,
                    "available": true
                }
            ]
        },
        {
            "_id": "65217a8b9d3f1234567893",
            "storeId": "65217a8b9d3f1234567891",
            "itemName": "Espresso",
            "description": "Strong Italian coffee",
            "available": true,
            "image": "https://res.cloudinary.com/.../espresso.jpg",
            "variants": [
                {
                    "name": "Single",
                    "price": 100,
                    "available": true
                },
                {
                    "name": "Double",
                    "price": 160,
                    "available": true
                }
            ]
        }
    ]
}
```

### Error Responses

**Code:** 404 NOT FOUND
```json
{
    "message": "No items found for this store"
}
```

---

## Variant Management

### 1. Add Variant

**Endpoint:** `POST /addvariant/:itemId`  
**Auth Required:** Yes (Store token required)

### Request Example
```json
{
    "variantName": "Medium",
    "price": 140
}
```

### Success Response
**Code:** 201 CREATED
```json
{
    "message": "Variant added successfully",
    "item": {
        "variants": [
            {
                "name": "Small",
                "price": 120,
                "available": true
            },
            {
                "name": "Medium",
                "price": 140,
                "available": true
            }
        ]
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When variant exists*
```json
{
    "message": "Variant with this name already exists"
}
```

---

### 2. Edit Variant

**Endpoint:** `PUT /editvariant/:itemId/:variantId`  
**Auth Required:** Yes (Store token required)

### Request Example
```json
{
    "variantName": "Regular",
    "price": 130
}
```

### Success Response
**Code:** 200 OK
```json
{
    "message": "Variant updated successfully",
    "item": {
        "variants": [
            {
                "name": "Regular",
                "price": 130,
                "available": true
            }
        ]
    }
}
```

---

### 3. Update Variant Availability

**Endpoint:** `PUT /editvariant/available/:itemId/:variantId`  
**Auth Required:** Yes (Store token required)

### Request Example
```json
{
    "available": false
}
```

### Success Response
**Code:** 200 OK
```json
{
    "message": "Variant marked as unavailable",
    "variant": {
        "name": "Regular",
        "price": 130,
        "available": false
    }
}
```

---

### 4. Remove Variant

**Endpoint:** `DELETE /removevariant/:itemId/:variantId`  
**Auth Required:** Yes (Store token required)

### Success Response
**Code:** 200 OK
```json
{
    "message": "Variant removed successfully",
    "item": {
        "variants": [
            {
                "name": "Large",
                "price": 180,
                "available": true
            }
        ]
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST
```json
{
    "message": "Cannot remove the only remaining variant"
}
```

## Test Item Routes with cURL

### Add Item
```bash
curl -X POST http://localhost:3000/api/item/add \
-H "Authorization: Bearer STORE_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{
    "itemName": "Cappuccino",
    "description": "Italian coffee drink",
    "price": 150
}'
```

### Upload Item Image
```bash
curl -X PUT http://localhost:3000/api/item/upload-image/65217a8b9d3f1234567890 \
-H "Authorization: Bearer STORE_TOKEN_HERE" \
-F "image=@/path/to/image.jpg"
```

### Add Variant
```bash
curl -X POST http://localhost:3000/api/item/addvariant/65217a8b9d3f1234567890 \
-H "Authorization: Bearer STORE_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{
    "variantName": "Medium",
    "price": 140
}'
```

# Order API Documentation

Documentation for all order-related routes including creation, management, and filtering.

## 1. Create Order

**Endpoint:** `POST /create`  
**Auth Required:** No (Customer facing endpoint)

### Request Example
```json
{
    "storeId": "65217a8b9d3f1234567891",
    "tableId": "65217a8b9d3f1234567892",
    "username": "John",
    "items": [
        {
            "itemId": "65217a8b9d3f1234567893",
            "itemName": "Cappuccino",
            "variants": [
                {
                    "type": "Small",
                    "quantity": 2,
                    "price": 120
                },
                {
                    "type": "Large",
                    "quantity": 1,
                    "price": 180
                }
            ]
        }
    ]
}
```

### Success Response
**Code:** 201 CREATED
```json
{
    "message": "Order placed successfully",
    "order": {
        "_id": "65217a8b9d3f1234567894",
        "storeId": "65217a8b9d3f1234567891",
        "tableId": "65217a8b9d3f1234567892",
        "username": "John",
        "items": [
            {
                "itemId": "65217a8b9d3f1234567893",
                "itemName": "Cappuccino",
                "variants": [
                    {
                        "type": "Small",
                        "quantity": 2,
                        "price": 120,
                        "total": 240
                    },
                    {
                        "type": "Large",
                        "quantity": 1,
                        "price": 180,
                        "total": 180
                    }
                ],
                "totalItemPrice": 420
            }
        ],
        "gstApplicable": true,
        "gstRate": 0.05,
        "gstAmount": 21,
        "restaurantChargeApplicable": true,
        "restaurantCharge": 10,
        "restaurantChargeAmount": 10,
        "subTotal": 420,
        "totalAmount": 451,
        "status": "pending",
        "createdAt": "2025-10-07T10:00:00.000Z"
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When validation fails*
```json
{
    "errors": [
        {
            "msg": "Items are required",
            "param": "items",
            "location": "body"
        }
    ]
}
```

**Code:** 400 BAD REQUEST  
*When item not available*
```json
{
    "message": "Item 'Cappuccino' is not available or doesn't exist."
}
```

**Code:** 403 FORBIDDEN  
*When price tampering detected*
```json
{
    "message": "Autonomous behavior detected: Price mismatch detected."
}
```

**Code:** 404 NOT FOUND  
*When store/table not found*
```json
{
    "message": "Store not found"
}
```

---

## 2. Get Store Orders

**Endpoint:** `GET /store-orders`  
**Auth Required:** Yes (Store token required)

### Success Response
**Code:** 200 OK
```json
{
    "message": "Orders fetched successfully",
    "count": 2,
    "orders": [
        {
            "_id": "65217a8b9d3f1234567894",
            "tableId": {
                "_id": "65217a8b9d3f1234567892",
                "tableNumber": 1
            },
            "username": "John",
            "status": "pending",
            "totalAmount": 451,
            "createdAt": "2025-10-07T10:00:00.000Z"
        },
        {
            "_id": "65217a8b9d3f1234567895",
            "tableId": {
                "_id": "65217a8b9d3f1234567896",
                "tableNumber": 2
            },
            "username": "Alice",
            "status": "completed",
            "totalAmount": 325,
            "createdAt": "2025-10-07T09:30:00.000Z"
        }
    ]
}
```

---

## 3. Get Table Orders

**Endpoint:** `GET /table/:tableId`  
**Auth Required:** Yes (Store token required)

### Success Response
**Code:** 200 OK
```json
{
    "message": "Table orders fetched successfully",
    "count": 1,
    "orders": [
        {
            "_id": "65217a8b9d3f1234567894",
            "username": "John",
            "status": "pending",
            "totalAmount": 451,
            "items": [
                {
                    "itemName": "Cappuccino",
                    "variants": [
                        {
                            "type": "Small",
                            "quantity": 2,
                            "total": 240
                        }
                    ]
                }
            ]
        }
    ]
}
```

### Error Responses

**Code:** 404 NOT FOUND
```json
{
    "message": "No orders found for this table"
}
```

---

## 4. Update Order Status

**Endpoint:** `PUT /status/:orderId`  
**Auth Required:** Yes (Store token required)

### Request Example
```json
{
    "status": "confirmed"
}
```

### Success Response
**Code:** 200 OK
```json
{
    "message": "Order status updated to 'confirmed'",
    "order": {
        "_id": "65217a8b9d3f1234567894",
        "status": "confirmed",
        "updatedAt": "2025-10-07T10:15:00.000Z"
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST
```json
{
    "errors": [
        {
            "msg": "Invalid status value",
            "param": "status",
            "location": "body"
        }
    ]
}
```

---

## 5. Get Order Details

**Endpoint:** `GET /:orderId`  
**Auth Required:** No

### Success Response
**Code:** 200 OK
```json
{
    "message": "Order details fetched successfully",
    "order": {
        "_id": "65217a8b9d3f1234567894",
        "storeId": {
            "storeName": "Coffee House",
            "storeDetails": {
                "address": "123 Coffee Street"
            }
        },
        "tableId": {
            "tableNumber": 1
        },
        "items": [
            {
                "itemName": "Cappuccino",
                "variants": [
                    {
                        "type": "Small",
                        "quantity": 2,
                        "total": 240
                    }
                ]
            }
        ],
        "status": "confirmed",
        "totalAmount": 451
    }
}
```

---

## 6. Cancel Order

**Endpoint:** `PUT /cancel/:orderId`  
**Auth Required:** Yes (Store token required)

### Success Response
**Code:** 200 OK
```json
{
    "message": "Order cancelled successfully",
    "order": {
        "_id": "65217a8b9d3f1234567894",
        "status": "cancelled",
        "updatedAt": "2025-10-07T10:20:00.000Z"
    }
}
```

### Error Responses

**Code:** 400 BAD REQUEST  
*When order already completed/cancelled*
```json
{
    "message": "Order cannot be cancelled as it is already 'completed'"
}
```

---

## 7. Get Orders by Date

**Endpoint:** `GET /store-orders/date`  
**Auth Required:** Yes (Store token required)

### Request Example
Query parameter: `?date=2025-10-07`

### Success Response
**Code:** 200 OK
```json
{
    "message": "Orders for 2025-10-07 fetched successfully",
    "count": 2,
    "orders": [
        {
            "_id": "65217a8b9d3f1234567894",
            "tableId": {
                "tableNumber": 1
            },
            "status": "completed",
            "totalAmount": 451,
            "createdAt": "2025-10-07T10:00:00.000Z"
        }
    ]
}
```

---

## 8. Get Orders by Status

**Endpoint:** `GET /store-orders/status`  
**Auth Required:** Yes (Store token required)

### Request Example
Query parameter: `?status=pending`

### Success Response
**Code:** 200 OK
```json
{
    "message": "Orders with status 'pending' fetched successfully",
    "count": 1,
    "orders": [
        {
            "_id": "65217a8b9d3f1234567894",
            "tableId": {
                "tableNumber": 1
            },
            "status": "pending",
            "totalAmount": 451,
            "createdAt": "2025-10-07T10:00:00.000Z"
        }
    ]
}
```

### Error Responses

**Code:** 400 BAD REQUEST
```json
{
    "message": "Invalid status value"
}
```

## Test Order Routes with cURL

### Create Order
```bash
curl -X POST http://localhost:3000/api/order/create \
-H "Content-Type: application/json" \
-d '{
    "storeId": "65217a8b9d3f1234567891",
    "tableId": "65217a8b9d3f1234567892",
    "username": "John",
    "items": [
        {
            "itemId": "65217a8b9d3f1234567893",
            "itemName": "Cappuccino",
            "variants": [
                {
                    "type": "Small",
                    "quantity": 2,
                    "price": 120
                }
            ]
        }
    ]
}'
```

### Update Order Status
```bash
curl -X PUT http://localhost:3000/api/order/status/65217a8b9d3f1234567894 \
-H "Authorization: Bearer STORE_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{
    "status": "confirmed"
}'
```

### Get Orders by Date
```bash
curl -X GET "http://localhost:3000/api/order/store-orders/date?date=2025-10-07" \
-H "Authorization: Bearer STORE_TOKEN_HERE"
```
