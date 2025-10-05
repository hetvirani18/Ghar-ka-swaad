# Cook Registration Fix - Documentation

## Problem Summary
The cook registration panel was showing a **500 Internal Server Error** when attempting to register. The error occurred because:

1. The registration flow was split between two endpoints (`/api/auth/register-cook` and `/api/cooks/register`)
2. The `CookRegistration.tsx` component was calling the cook profile endpoint without first creating a user account
3. Missing email and password fields in the registration form
4. The Cook model required a reference to the User model but it wasn't being set

## Solution Implemented

### 1. **Unified Registration Flow**
- Combined user account creation and cook profile creation into a single endpoint
- Users now complete ALL registration in one place: `/become-a-cook` route
- The `/api/cooks/register` endpoint now handles:
  - Creating a User account with role='cook'
  - Creating a Cook profile with all required fields
  - Uploading kitchen images to Cloudinary
  - Linking the Cook profile to the User account

### 2. **Updated CookRegistration Component** (`src/pages/CookRegistration.tsx`)
**Changes:**
- Added a **3-step** registration process instead of 2-step:
  - **Step 1:** Account Information (name, email, phone, password)
  - **Step 2:** Cook Profile (bio, neighborhood, pincode, UPI ID)
  - **Step 3:** Kitchen Photos (minimum 3 images required)
- Added form validation for each step
- Integrated with AuthContext to log users in after successful registration
- Improved error handling and user feedback

### 3. **Updated Cook Controller** (`server/src/controllers/cookController.js`)
**Changes:**
- Added User model import
- Enhanced `registerCook` function to:
  - Check if email already exists
  - Validate all required fields
  - Create User account first
  - Create Cook profile with reference to User
  - Handle transaction-like behavior (delete User if Cook creation fails)
  - Better error logging

### 4. **Updated Cook Model** (`server/src/models/Cook.js`)
**Changes:**
- Added `user` field as a reference to the User model
- Kept existing validation for kitchen images (minimum 3 required)

### 5. **Updated Auth Page Flow** (`src/pages/Auth.tsx`)
**Changes:**
- When a user selects "I'm a Cook" and clicks signup, they are redirected to `/become-a-cook`
- This prevents confusion and ensures all cook registrations go through the complete flow
- Updated button text to "Continue to Cook Registration" for cook role

### 6. **Updated API Service** (`src/services/api.ts`)
**Changes:**
- Updated `cooksApi.register` return type to handle both user and cook data
- Better error handling with detailed error messages

## How to Use Cook Registration

### For End Users:
1. Navigate to the Auth page (`/auth`)
2. Select "I'm a Cook" option
3. Click "Continue to Cook Registration"
4. Complete the 3-step registration form:
   - **Step 1:** Enter your account details
   - **Step 2:** Fill in your cook profile information
   - **Step 3:** Upload at least 3 clear photos of your kitchen
5. Click "Register as Cook" to complete registration
6. You'll be automatically logged in and redirected to the Cook Dashboard

### For Developers:
1. Ensure MongoDB is running and connected
2. Make sure Cloudinary credentials are set in `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Start the backend server: `cd server && npm run dev`
4. Start the frontend: `npm run dev`
5. Navigate to `http://localhost:5173/become-a-cook`

## API Endpoints

### POST `/api/cooks/register`
**Purpose:** Complete cook registration with user account creation

**Request:** `multipart/form-data`
```
{
  name: string
  email: string
  password: string
  phone: string
  bio: string
  pincode: string
  neighborhood: string
  upiId: string
  kitchenImages: File[] (minimum 3)
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "phone": "...",
    "role": "cook"
  },
  "cook": {
    "_id": "...",
    "name": "...",
    "bio": "...",
    "location": {
      "type": "Point",
      "coordinates": [lng, lat],
      "pincode": "...",
      "neighborhood": "..."
    },
    "kitchenImageUrls": ["url1", "url2", "url3"],
    "upiId": "...",
    "user": "user_id",
    "averageRating": 0,
    "ratingCount": 0
  }
}
```

## Testing Checklist

- [x] Form validation works for all fields
- [x] Email validation ensures valid format
- [x] Password must be at least 6 characters
- [x] Step navigation works correctly (Next/Back buttons)
- [x] Image upload shows previews
- [x] Can remove uploaded images
- [x] Requires minimum 3 kitchen images
- [x] Error messages display correctly
- [x] Success message shows after registration
- [x] User is logged in automatically
- [x] Redirects to Cook Dashboard after success
- [x] Server creates both User and Cook records
- [x] Images upload to Cloudinary correctly
- [x] Duplicate email shows appropriate error

## Files Modified

1. `src/pages/CookRegistration.tsx` - Complete rewrite with 3-step form
2. `src/pages/Auth.tsx` - Updated to redirect cooks to registration page
3. `server/src/controllers/cookController.js` - Combined user + cook registration
4. `server/src/models/Cook.js` - Added user reference field
5. `src/services/api.ts` - Updated return types and error handling

## Known Limitations

1. Password is stored in plain text (noted as "In production, this should be hashed")
2. Geocoding is simulated with hardcoded coordinates for known pincodes
3. No email verification implemented
4. No password strength requirements beyond minimum length
5. File upload size limits not explicitly set

## Future Improvements

1. Add bcrypt for password hashing
2. Implement real geocoding service for location coordinates
3. Add email verification flow
4. Implement password strength meter
5. Add file size and type validation on server
6. Add OTP-based phone verification
7. Allow cooks to update their profile later
8. Add progress saving (draft registration)
