# How to Link a User Account to an Employee Record

## Problem

If you're getting a `403 Forbidden` error when accessing ESS endpoints with an EMPLOYEE role user, it means the User account doesn't have an `employeeId` linked to it.

The middleware requires:
- Users with `EMPLOYEE` role MUST have an `employeeId` linked
- The Employee record must exist and be `ACTIVE`

## Solution

You have two options:

### Option 1: Link to an Existing Employee Record

If you already have an Employee record in the database:

1. **Find the Employee ID** (you can use Prisma Studio or MongoDB Compass):
   ```bash
   # Using Prisma Studio (recommended)
   npx prisma studio
   # Then navigate to Employee model and find the ID
   ```

2. **Link the User to Employee** using the script:
   ```bash
   npx ts-node src/scripts/linkUserToEmployee.ts <userEmail> <employeeId>
   ```

   Example:
   ```bash
   npx ts-node src/scripts/linkUserToEmployee.ts employee@example.com 507f1f77bcf86cd799439011
   ```

### Option 2: Create a New Employee Record and Link

If you don't have an Employee record yet:

```bash
npx ts-node src/scripts/linkUserToEmployee.ts <userEmail> --create "Employee Name" [email] [department]
```

Example:
```bash
npx ts-node src/scripts/linkUserToEmployee.ts employee@example.com --create "John Doe" john@example.com "Engineering"
```

## Alternative: Using Prisma Studio (GUI)

1. Start Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Open the **User** model
3. Find your user by email
4. Click on the user record
5. Find the `employeeId` field
6. If you have an Employee ID, paste it there and save
7. If you need to create an Employee first:
   - Go to the **Employee** model
   - Click "Add record"
   - Fill in required fields (name, employeeId will be auto-generated)
   - Save and copy the Employee ID
   - Go back to User and paste the Employee ID in `employeeId` field

## Alternative: Using MongoDB Directly

If you prefer using MongoDB directly:

```javascript
// Connect to MongoDB (use your connection string)
// Then run:

// 1. Find your User ID
db.User.findOne({ email: "employee@example.com" }, { _id: 1 })

// 2. Find or create Employee (if needed)
// Employee will be auto-created by the script, or you can create manually
db.Employee.findOne({ email: "employee@example.com" }, { _id: 1 })

// 3. Update User with employeeId
db.User.updateOne(
  { _id: ObjectId("USER_ID_HERE") },
  { $set: { employeeId: ObjectId("EMPLOYEE_ID_HERE") } }
)
```

## Verification

After linking, verify the link:

```bash
# Using Prisma Studio
npx prisma studio
# Check the User model - employeeId should now be filled
```

Or using the script (you can modify it to add a verify function).

## Important Notes

- The `employeeId` field in the User model is **unique**, so one Employee can only be linked to one User
- The Employee record must exist and have status `ACTIVE` for ESS access to work
- Once linked, the user should be able to access ESS endpoints without the 403 error

## Troubleshooting

- **Error: "Employee is already linked to another user"**
  - The Employee record is already linked to a different User
  - You need to either unlink it first or use a different Employee record

- **Error: "Employee record not found"**
  - The Employee ID you provided doesn't exist
  - Create the Employee first using Option 2

- **Error: "Employee account is not active"**
  - The Employee exists but has status `INACTIVE`
  - Update the Employee status to `ACTIVE` in Prisma Studio

