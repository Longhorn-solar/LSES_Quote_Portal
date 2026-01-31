#!/usr/bin/env python3
"""
Backend API Testing for Longhorn Solar Energy Efficiency Estimator
Tests all endpoints including auth, projects, bids, and AI recommendations
"""

import requests
import sys
import json
from datetime import datetime, timezone, timedelta
import uuid
import time

class LonghornSolarAPITester:
    def __init__(self, base_url="https://fe71e4c9-aea4-451b-8683-eac38152a154.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.test_user_id = None
        self.test_project_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"Response: {response.text[:200]}", "ERROR")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}", "ERROR")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_services_endpoint(self):
        """Test services endpoint returns all 19 services"""
        success, response = self.run_test(
            "Services Endpoint",
            "GET", 
            "api/services",
            200
        )
        
        if success:
            service_count = len(response)
            if service_count == 19:
                self.log(f"✅ Services endpoint returned {service_count} services", "PASS")
                return True
            else:
                self.log(f"❌ Expected 19 services, got {service_count}", "FAIL")
                self.failed_tests.append({
                    "test": "Services Count",
                    "expected": 19,
                    "actual": service_count
                })
                return False
        return False

    def test_auth_session_invalid(self):
        """Test auth/session endpoint rejects invalid session_id"""
        success, response = self.run_test(
            "Auth Session Invalid",
            "POST",
            "api/auth/session",
            401,
            data={"session_id": "invalid_session_id_12345"}
        )
        return success

    def test_auth_me_unauthorized(self):
        """Test auth/me endpoint rejects unauthorized requests"""
        # Temporarily clear session token
        temp_token = self.session_token
        self.session_token = None
        
        success, response = self.run_test(
            "Auth Me Unauthorized",
            "GET",
            "api/auth/me",
            401
        )
        
        # Restore session token
        self.session_token = temp_token
        return success

    def create_test_user_and_session(self):
        """Create test user and session in MongoDB for testing"""
        try:
            import pymongo
            from pymongo import MongoClient
            
            # Connect to MongoDB
            client = MongoClient("mongodb://localhost:27017")
            db = client["test_database"]
            
            # Create test user
            self.test_user_id = f"test_user_{uuid.uuid4().hex[:12]}"
            test_email = f"test.user.{int(time.time())}@longhornsolar.com"
            
            user_doc = {
                "user_id": self.test_user_id,
                "email": test_email,
                "name": "Test User",
                "picture": "https://via.placeholder.com/150",
                "created_at": datetime.now(timezone.utc)
            }
            
            db.users.insert_one(user_doc)
            
            # Create test session
            self.session_token = f"test_session_{uuid.uuid4().hex[:16]}"
            session_doc = {
                "user_id": self.test_user_id,
                "session_token": self.session_token,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
                "created_at": datetime.now(timezone.utc)
            }
            
            db.user_sessions.insert_one(session_doc)
            
            self.log(f"✅ Created test user: {self.test_user_id}", "SETUP")
            self.log(f"✅ Created test session: {self.session_token}", "SETUP")
            
            client.close()
            return True
            
        except Exception as e:
            self.log(f"❌ Failed to create test user: {str(e)}", "ERROR")
            return False

    def test_auth_me_authorized(self):
        """Test auth/me endpoint with valid session"""
        success, response = self.run_test(
            "Auth Me Authorized",
            "GET",
            "api/auth/me",
            200
        )
        
        if success and response.get("user_id") == self.test_user_id:
            self.log("✅ Auth/me returned correct user data", "PASS")
            return True
        elif success:
            self.log(f"❌ Auth/me returned wrong user_id: {response.get('user_id')}", "FAIL")
            return False
        return success

    def test_projects_crud(self):
        """Test projects CRUD operations"""
        # Test GET projects (should be empty initially)
        success, projects = self.run_test(
            "Get Projects (Empty)",
            "GET",
            "api/projects",
            200
        )
        
        if not success:
            return False

        # Test CREATE project
        project_data = {
            "clientName": "Test Client",
            "phoneNumber": "512-555-0123",
            "siteAddress": {
                "address1": "123 Test St",
                "city": "Austin",
                "state": "TX",
                "zip": "78701"
            }
        }
        
        success, project = self.run_test(
            "Create Project",
            "POST",
            "api/projects",
            201,
            data=project_data
        )
        
        if not success:
            return False
            
        self.test_project_id = project.get("project_id")
        self.log(f"✅ Created project: {self.test_project_id}", "PASS")

        # Test GET specific project
        success, project_detail = self.run_test(
            "Get Project Detail",
            "GET",
            f"api/projects/{self.test_project_id}",
            200
        )
        
        if not success:
            return False

        # Test UPDATE project
        update_data = {
            "clientName": "Updated Test Client",
            "status": "PROPOSED"
        }
        
        success, updated_project = self.run_test(
            "Update Project",
            "PUT",
            f"api/projects/{self.test_project_id}",
            200,
            data=update_data
        )
        
        return success

    def test_bid_update(self):
        """Test bid update functionality"""
        if not self.test_project_id:
            self.log("❌ No test project available for bid testing", "ERROR")
            return False

        bid_data = {
            "serviceName": "Solar",
            "selected": True,
            "estCost": 25000.00,
            "details": {
                "System Size (kW)": "10",
                "Panel Count": "30",
                "Inverter Type (Micro/String)": "Micro"
            },
            "notes": "South-facing roof, good solar exposure"
        }
        
        success, response = self.run_test(
            "Update Bid",
            "PUT",
            f"api/projects/{self.test_project_id}/bids/Solar",
            200,
            data=bid_data
        )
        
        return success

    def test_ai_recommendations(self):
        """Test AI recommendations endpoint"""
        ai_request = {
            "serviceName": "Solar",
            "notes": "South-facing roof, 2000 sq ft home, high electricity bills",
            "otherSelectedServices": ["Insulation", "Smart Thermostat"]
        }
        
        success, response = self.run_test(
            "AI Recommendations",
            "POST",
            "api/ai/recommendations",
            200,
            data=ai_request
        )
        
        if success and "recommendations" in response:
            self.log("✅ AI recommendations generated successfully", "PASS")
            return True
        elif success:
            self.log("❌ AI response missing recommendations field", "FAIL")
            return False
        return success

    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        try:
            import pymongo
            from pymongo import MongoClient
            
            client = MongoClient("mongodb://localhost:27017")
            db = client["test_database"]
            
            # Delete test user and session
            if self.test_user_id:
                db.users.delete_one({"user_id": self.test_user_id})
                db.user_sessions.delete_one({"user_id": self.test_user_id})
                
            # Delete test project
            if self.test_project_id:
                db.projects.delete_one({"project_id": self.test_project_id})
                
            client.close()
            self.log("✅ Cleaned up test data", "CLEANUP")
            
        except Exception as e:
            self.log(f"⚠️ Cleanup warning: {str(e)}", "WARNING")

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting Longhorn Solar Backend API Tests", "START")
        
        # Basic endpoint tests (no auth required)
        self.test_health_check()
        self.test_services_endpoint()
        self.test_auth_session_invalid()
        self.test_auth_me_unauthorized()
        
        # Create test user for auth-required tests
        if not self.create_test_user_and_session():
            self.log("❌ Cannot continue without test user", "FATAL")
            return False
            
        # Auth-required tests
        self.test_auth_me_authorized()
        self.test_projects_crud()
        self.test_bid_update()
        self.test_ai_recommendations()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print results
        self.log("=" * 50, "RESULTS")
        self.log(f"Tests Run: {self.tests_run}", "RESULTS")
        self.log(f"Tests Passed: {self.tests_passed}", "RESULTS")
        self.log(f"Tests Failed: {len(self.failed_tests)}", "RESULTS")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%", "RESULTS")
        
        if self.failed_tests:
            self.log("Failed Tests:", "RESULTS")
            for failure in self.failed_tests:
                self.log(f"  - {failure}", "RESULTS")
        
        return len(self.failed_tests) == 0

def main():
    """Main test runner"""
    tester = LonghornSolarAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())