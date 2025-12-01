# Migration Scripts

## Competency System Migration

### Prerequisites

1. Backup your database before running any migrations
2. Ensure you have the latest Prisma schema
3. Run Prisma migrations first: `npx prisma migrate dev`

### Running the Migration

1. **Update Prisma Schema**
   ```bash
   npx prisma migrate dev --name migrate_competency_system
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Run Data Migration (if needed)**
   ```bash
   npx ts-node backend/src/scripts/migrateCompetencyData.ts
   ```

### What Gets Migrated

- **CompetencyAssessment → EmployeeCompetency**: 
  - `selfScore` → `selfRating`
  - `hrScore` → `managerRating`
  - `finalScore` calculated: `(selfRating * 0.3 + managerRating * 0.7) * (weight / 100)`

- **Competency Model Updates**:
  - `requiredLevel` and `category` (string) removed
  - `categoryId`, `levels[]`, and `weight` added
  - Existing competencies will need to be updated manually or via script

### Manual Steps Required

1. **Update Existing Competencies**:
   - Assign each competency to a category (create categories first if needed)
   - Define proficiency levels (1-5) for each competency
   - Set weight (1-100) for each competency

2. **Migrate CompetencyAssessment Data**:
   - The migration script provides instructions
   - You may need to manually map old data to new structure

3. **Verify Data**:
   - Check that all employee competencies are properly migrated
   - Verify gap analyses are generated correctly
   - Test the new endpoints

### Rollback

If you need to rollback:
1. Restore from database backup
2. Revert Prisma migrations: `npx prisma migrate resolve --rolled-back <migration_name>`

