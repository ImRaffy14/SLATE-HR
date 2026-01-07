"use strict";
/**
 * Migration script to migrate data from CompetencyAssessment to EmployeeCompetency
 *
 * This script:
 * 1. Migrates existing CompetencyAssessment records to EmployeeCompetency
 * 2. Calculates finalScore from selfScore and hrScore
 * 3. Sets default weight for existing competencies (if needed)
 *
 * Run with: npx ts-node backend/src/scripts/migrateCompetencyData.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
async function migrateCompetencyData() {
    console.log('Starting competency data migration...');
    try {
        // Check if CompetencyAssessment model still exists (it might have been removed)
        // Since we're using MongoDB, we can query the old collection directly
        // Note: This assumes the old model data is still accessible
        // First, let's check if there are any competencies that need default weight
        const competenciesWithoutWeight = await prisma_1.default.$queryRaw `
      db.competencies.find({ weight: { $exists: false } })
    `;
        if (competenciesWithoutWeight && competenciesWithoutWeight.length > 0) {
            console.log(`Found ${competenciesWithoutWeight.length} competencies without weight. Setting default weight of 50...`);
            // Set default weight for competencies that don't have it
            // Note: This is a simplified approach. In production, you might want to calculate based on category or other factors
            for (const comp of competenciesWithoutWeight) {
                await prisma_1.default.$executeRaw `
          db.competencies.updateOne(
            { _id: ${comp._id} },
            { $set: { weight: 50 } }
          )
        `;
            }
            console.log('Default weights set successfully.');
        }
        // Note: The actual migration from CompetencyAssessment to EmployeeCompetency
        // would require accessing the old collection. Since Prisma might have already
        // removed the model, we'll provide a manual migration guide instead.
        console.log(`
    ============================================
    MIGRATION INSTRUCTIONS
    ============================================
    
    To migrate CompetencyAssessment data to EmployeeCompetency:
    
    1. Run Prisma migration to update schema:
       npx prisma migrate dev --name migrate_competency_system
    
    2. If you have existing CompetencyAssessment data, you can migrate it manually:
    
       For each CompetencyAssessment record:
       - Map selfScore -> selfRating
       - Map hrScore -> managerRating
       - Calculate finalScore: (selfRating * 0.3 + managerRating * 0.7) * (competency.weight / 100)
       - Set updatedBy to the user who created the assessment (or a default HR user)
       - Create EmployeeCompetency record with these values
    
    3. After migration, you can safely remove the old CompetencyAssessment collection
       (if you're sure all data has been migrated)
    
    ============================================
    `);
        // If you want to automate the migration, uncomment and modify the following:
        /*
        const assessments = await prisma.$queryRaw`
          db.competencyAssessments.find({})
        ` as any[];
    
        console.log(`Found ${assessments.length} assessments to migrate...`);
    
        for (const assessment of assessments) {
          // Get the competency to get its weight
          const competency = await prisma.competency.findUnique({
            where: { id: assessment.competencyId }
          });
    
          if (!competency) {
            console.warn(`Competency ${assessment.competencyId} not found, skipping assessment ${assessment._id}`);
            continue;
          }
    
          const weight = competency.weight || 50; // Default to 50 if not set
          const selfRating = assessment.selfScore;
          const managerRating = assessment.hrScore;
          
          // Calculate finalScore
          const finalScore = (selfRating * 0.3 + managerRating * 0.7) * (weight / 100);
    
          // Create EmployeeCompetency record
          await prisma.employeeCompetency.create({
            data: {
              employeeId: assessment.employeeId,
              competencyId: assessment.competencyId,
              selfRating: selfRating,
              managerRating: managerRating,
              finalScore: finalScore,
              updatedBy: null, // Set to appropriate user ID if available
              attachments: [],
            }
          });
    
          console.log(`Migrated assessment ${assessment._id} to EmployeeCompetency`);
        }
    
        console.log('Migration completed successfully!');
        */
        console.log('Migration script completed. Please review the instructions above.');
    }
    catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
// Run migration if this file is executed directly
if (require.main === module) {
    migrateCompetencyData()
        .then(() => {
        console.log('Migration process finished.');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
}
exports.default = migrateCompetencyData;
