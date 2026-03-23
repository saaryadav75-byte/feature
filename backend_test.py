import requests
import sys
import json
from datetime import datetime

class SmartLearningAPITester:
    def __init__(self, base_url="https://smart-study-199.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "status": "PASSED" if success else "FAILED",
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            self.log_test("Root Endpoint", success, "" if success else f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Root Endpoint", False, str(e))
            return False

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}",
            "role": "student"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login with demo account"""
        login_data = {
            "email": "student@test.com",
            "password": "password123"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        return success

    def test_courses_list(self):
        """Test courses listing"""
        success, response = self.run_test(
            "Courses List",
            "GET",
            "courses",
            200
        )
        
        if success and isinstance(response, list):
            self.courses = response
            return True
        return False

    def test_course_enrollment(self):
        """Test course enrollment"""
        if not hasattr(self, 'courses') or not self.courses:
            self.log_test("Course Enrollment", False, "No courses available for enrollment")
            return False
        
        course_id = self.courses[0]['id']
        success, response = self.run_test(
            "Course Enrollment",
            "POST",
            f"courses/{course_id}/enroll",
            200
        )
        
        if success:
            self.enrolled_course_id = course_id
        return success

    def test_course_details(self):
        """Test course details endpoint"""
        if not hasattr(self, 'enrolled_course_id'):
            self.log_test("Course Details", False, "No enrolled course to test")
            return False
        
        success, response = self.run_test(
            "Course Details",
            "GET",
            f"courses/{self.enrolled_course_id}",
            200
        )
        return success

    def test_course_lessons(self):
        """Test course lessons endpoint"""
        if not hasattr(self, 'enrolled_course_id'):
            self.log_test("Course Lessons", False, "No enrolled course to test")
            return False
        
        success, response = self.run_test(
            "Course Lessons",
            "GET",
            f"courses/{self.enrolled_course_id}/lessons",
            200
        )
        return success

    def test_user_progress(self):
        """Test user progress endpoint"""
        if not hasattr(self, 'enrolled_course_id'):
            self.log_test("User Progress", False, "No enrolled course to test")
            return False
        
        success, response = self.run_test(
            "User Progress",
            "GET",
            f"progress/course/{self.enrolled_course_id}",
            200
        )
        return success

    def test_food_items_list(self):
        """Test food items listing"""
        success, response = self.run_test(
            "Food Items List",
            "GET",
            "food-items",
            200
        )
        
        if success and isinstance(response, list):
            self.food_items = response
            return True
        return False

    def test_food_recommendations(self):
        """Test food recommendations endpoint"""
        success, response = self.run_test(
            "Food Recommendations",
            "GET",
            "food-items/recommend",
            200
        )
        return success

    def test_create_food_order(self):
        """Test creating a food order"""
        if not hasattr(self, 'food_items') or not self.food_items:
            self.log_test("Create Food Order", False, "No food items available for order")
            return False
        
        order_data = {
            "items": [
                {
                    "food_id": self.food_items[0]['id'],
                    "food_name": self.food_items[0]['name'],
                    "quantity": 2,
                    "price": self.food_items[0]['price']
                }
            ]
        }
        
        success, response = self.run_test(
            "Create Food Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        return success

    def test_focus_sessions(self):
        """Test focus sessions endpoint"""
        success, response = self.run_test(
            "Focus Sessions List",
            "GET",
            "focus-sessions",
            200
        )
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Smart Learning Platform API Tests")
        print("=" * 60)
        
        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test authentication flow
        if not self.test_user_login():
            print("❌ Login failed, trying registration...")
            if not self.test_user_registration():
                print("❌ Both login and registration failed. Stopping tests.")
                return False
        
        # Test authenticated endpoints
        self.test_get_current_user()
        self.test_dashboard_stats()
        
        # Test courses functionality
        self.test_courses_list()
        self.test_course_enrollment()
        self.test_course_details()
        self.test_course_lessons()
        self.test_user_progress()
        
        # Test food functionality
        self.test_food_items_list()
        self.test_food_recommendations()
        self.test_create_food_order()
        
        # Test additional features
        self.test_focus_sessions()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    tester = SmartLearningAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())