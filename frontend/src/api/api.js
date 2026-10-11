const defaultApiUrl = import.meta.env.PROD ? "/api" : "http://localhost:5000";
const BASE_URL = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/+$/, "");

const getToken = () => localStorage.getItem("token");

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

const request = async (endpoint, options = {}) => {
  const { auth = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (!token) return { success: false, status: 401, message: "Please login to continue." };
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...fetchOptions, headers });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { success: response.ok, message: await response.text() };

    if (response.status === 401 && auth) clearAuth();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Request failed.",
      };
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    return {
      success: false,
      status: 0,
      message: `Unable to connect to the backend. Make sure it is running on ${BASE_URL}.`,
    };
  }
};

export const loginUser = (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) });
export const signupUser = (data) => request("/auth/signup", { method: "POST", body: JSON.stringify(data) });
export const getAllCourses = () => request("/courses", { auth: true });
export const addCourse = (course) => request("/courses", { method: "POST", auth: true, body: JSON.stringify(course) });
export const updateCourse = (id, course) => request(`/courses/${id}`, { method: "PUT", auth: true, body: JSON.stringify(course) });
export const deleteCourse = (id) => request(`/courses/${id}`, { method: "DELETE", auth: true });
export const enrollInCourse = (courseId) => request(`/enroll/${courseId}`, { method: "POST", auth: true });
export const getMyCourses = () => request("/enroll/my-courses", { auth: true });
export const getAdminStats = () => request("/admin/stats", { auth: true });
export const getStudents = () => request("/admin/students", { auth: true });
export const getMyProfile = () => request("/students/me", { auth: true });
export const createStudent = (student) => request("/students", { method: "POST", auth: true, body: JSON.stringify(student) });
export const updateStudent = (id, student) => request(`/students/${id}`, { method: "PUT", auth: true, body: JSON.stringify(student) });
export const deleteStudent = (id) => request(`/students/${id}`, { method: "DELETE", auth: true });
export const getApiBaseUrl = () => BASE_URL;

export const generateQuiz = (courseId) =>
  request("/quiz/generate", { method: "POST", auth: true, body: JSON.stringify({ courseId }) });
export const getQuiz = (quizId) => request(`/quiz/${quizId}`, { auth: true });
export const submitQuiz = (quizId, answers) =>
  request(`/quiz/${quizId}/submit`, { method: "POST", auth: true, body: JSON.stringify({ answers }) });

export const getMyQuizStats = () => request("/quiz/my-stats", { auth: true });
