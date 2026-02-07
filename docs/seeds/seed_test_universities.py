"""
Test Universities Seed Script (Python/FastAPI)

Purpose: Seeds test universities for development and testing
These UUIDs match the frontend TEST_UNIVERSITIES constant

Usage:
    python seed_test_universities.py

Requirements:
    - Adjust imports to match your project structure
    - Ensure database connection is configured
    - Run from your backend directory
"""

from uuid import UUID
from datetime import datetime
from typing import List, Dict

# Adjust these imports to match your project structure
# from app.database import SessionLocal, engine
# from app.models.university import University
# from sqlalchemy.orm import Session

# Test universities data
# These IDs MUST match the frontend src/constants/testUniversities.ts
TEST_UNIVERSITIES: List[Dict] = [
    {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "Stanford University",
        "country": "USA",
        "city": "Stanford, California",
        "description": "Leading research university in California",
        "website": "https://www.stanford.edu",
    },
    {
        "id": "00000000-0000-0000-0000-000000000002",
        "name": "MIT",
        "country": "USA",
        "city": "Cambridge, Massachusetts",
        "description": "Massachusetts Institute of Technology",
        "website": "https://www.mit.edu",
    },
    {
        "id": "00000000-0000-0000-0000-000000000003",
        "name": "Harvard University",
        "country": "USA",
        "city": "Cambridge, Massachusetts",
        "description": "Ivy League research university",
        "website": "https://www.harvard.edu",
    },
    {
        "id": "00000000-0000-0000-0000-000000000004",
        "name": "Oxford University",
        "country": "UK",
        "city": "Oxford",
        "description": "Historic university in England",
        "website": "https://www.ox.ac.uk",
    },
    {
        "id": "00000000-0000-0000-0000-000000000005",
        "name": "Cambridge University",
        "country": "UK",
        "city": "Cambridge",
        "description": "Collegiate research university",
        "website": "https://www.cam.ac.uk",
    },
]


def seed_test_universities():
    """
    Seed test universities into the database
    
    This function:
    1. Creates a database session
    2. Checks if each university already exists
    3. Creates universities that don't exist
    4. Commits the changes
    5. Provides feedback on the operation
    """
    # db: Session = SessionLocal()
    
    print("=" * 60)
    print("🌱 Seeding Test Universities")
    print("=" * 60)
    
    try:
        created_count = 0
        existing_count = 0
        
        for uni_data in TEST_UNIVERSITIES:
            # Convert string UUID to UUID object
            university_id = UUID(uni_data["id"])
            
            # Check if university already exists
            # existing = db.query(University).filter(
            #     University.id == university_id
            # ).first()
            
            # For demonstration, we'll assume it doesn't exist
            # In your actual implementation, uncomment the above
            existing = None
            
            if not existing:
                # Create new university
                # university = University(
                #     id=university_id,
                #     name=uni_data["name"],
                #     country=uni_data["country"],
                #     city=uni_data["city"],
                #     description=uni_data["description"],
                #     website=uni_data["website"],
                #     created_at=datetime.utcnow(),
                #     updated_at=datetime.utcnow(),
                # )
                # db.add(university)
                print(f"✓ Created: {uni_data['name']}")
                created_count += 1
            else:
                print(f"○ Already exists: {uni_data['name']}")
                existing_count += 1
        
        # Commit the transaction
        # db.commit()
        
        print("\n" + "=" * 60)
        print(f"✅ Seeding complete!")
        print(f"   Created: {created_count}")
        print(f"   Already existed: {existing_count}")
        print(f"   Total universities: {created_count + existing_count}")
        print("=" * 60)
        
        # Verify the seed
        print("\n📋 Seeded Universities:")
        for uni in TEST_UNIVERSITIES:
            print(f"   • {uni['name']} ({uni['country']}) - ID: {uni['id']}")
        
    except Exception as e:
        # db.rollback()
        print(f"\n❌ Error seeding universities: {e}")
        raise
    finally:
        # db.close()
        pass


def verify_seed():
    """Verify that the seed was successful"""
    # db: Session = SessionLocal()
    
    try:
        print("\n" + "=" * 60)
        print("🔍 Verifying Seed")
        print("=" * 60)
        
        # Query test universities
        # test_unis = db.query(University).filter(
        #     University.id.in_([UUID(u["id"]) for u in TEST_UNIVERSITIES])
        # ).all()
        
        # For demonstration
        # print(f"Found {len(test_unis)} test universities in database")
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
    finally:
        # db.close()
        pass


if __name__ == "__main__":
    """
    Main execution
    
    To use this script:
    1. Adjust the imports at the top to match your project
    2. Uncomment the database operations
    3. Run: python seed_test_universities.py
    """
    
    print("\n" + "=" * 60)
    print("🎓 AdmissionTimes - Test Universities Seed Script")
    print("=" * 60)
    print("\n⚠️  IMPORTANT:")
    print("   This script requires customization for your project:")
    print("   1. Update imports to match your project structure")
    print("   2. Uncomment database operations")
    print("   3. Ensure database connection is configured")
    print("\n" + "=" * 60 + "\n")
    
    # Uncomment when ready to use
    # seed_test_universities()
    # verify_seed()
    
    # For now, just show what would be created
    print("📝 This script would create the following universities:\n")
    for uni in TEST_UNIVERSITIES:
        print(f"   {uni['name']}")
        print(f"      ID: {uni['id']}")
        print(f"      Country: {uni['country']}")
        print(f"      City: {uni['city']}\n")
    
    print("=" * 60)
    print("✅ Script ready. Uncomment database operations to use.")
    print("=" * 60)
