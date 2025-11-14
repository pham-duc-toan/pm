import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./ExerciseManagement.css";

function ExerciseManagement() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewExercise, setPreviewExercise] = useState(null);
  const [previewCode, setPreviewCode] = useState("");
  const [previewOutput, setPreviewOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    language: "javascript",
    timeLimit: 1000,
    memoryLimit: 256,
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    testCases: [
      { input: "", output: "", isPublic: true },
      { input: "", output: "", isPublic: false },
    ],
    starterCode: {
      javascript: "function solution() {\n  // Viết code của bạn ở đây\n  \n}",
      python: "def solution():\n    # Viết code của bạn ở đây\n    pass",
      java: "public class Solution {\n    public static void main(String[] args) {\n        // Viết code của bạn ở đây\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Viết code của bạn ở đây\n    return 0;\n}",
    },
    tags: [],
    isPublished: false,
  });

  // Load exercises từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("instructorExercises");
    if (stored) {
      const allExercises = JSON.parse(stored);
      const userExercises = allExercises.filter(
        (ex) => ex.instructorId === user?.id
      );
      setExercises(userExercises);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleStarterCodeChange = (language, code) => {
    setFormData({
      ...formData,
      starterCode: {
        ...formData.starterCode,
        [language]: code,
      },
    });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = value;
    setFormData({ ...formData, testCases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [
        ...formData.testCases,
        { input: "", output: "", isPublic: false },
      ],
    });
  };

  const removeTestCase = (index) => {
    if (formData.testCases.length > 1) {
      const newTestCases = formData.testCases.filter((_, i) => i !== index);
      setFormData({ ...formData, testCases: newTestCases });
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setFormData({ ...formData, tags });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const exerciseData = {
      ...formData,
      id: editingExercise?.id || Date.now(),
      instructorId: user?.id,
      instructorName: user?.fullName,
      createdAt: editingExercise?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalSubmissions: editingExercise?.totalSubmissions || 0,
      totalAccepted: editingExercise?.totalAccepted || 0,
      acceptanceRate: editingExercise?.acceptanceRate || 0,
    };

    const stored = localStorage.getItem("instructorExercises");
    let allExercises = stored ? JSON.parse(stored) : [];

    if (editingExercise) {
      allExercises = allExercises.map((ex) =>
        ex.id === editingExercise.id ? exerciseData : ex
      );
    } else {
      allExercises.push(exerciseData);
    }

    localStorage.setItem("instructorExercises", JSON.stringify(allExercises));

    const userExercises = allExercises.filter(
      (ex) => ex.instructorId === user?.id
    );
    setExercises(userExercises);

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      difficulty: "easy",
      language: "javascript",
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "",
      outputFormat: "",
      constraints: "",
      sampleInput: "",
      sampleOutput: "",
      testCases: [
        { input: "", output: "", isPublic: true },
        { input: "", output: "", isPublic: false },
      ],
      starterCode: {
        javascript:
          "function solution() {\n  // Viết code của bạn ở đây\n  \n}",
        python: "def solution():\n    # Viết code của bạn ở đây\n    pass",
        java: "public class Solution {\n    public static void main(String[] args) {\n        // Viết code của bạn ở đây\n    }\n}",
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Viết code của bạn ở đây\n    return 0;\n}",
      },
      tags: [],
      isPublished: false,
    });
    setEditingExercise(null);
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setFormData(exercise);
    setShowModal(true);
  };

  const handleDelete = (exerciseId) => {
    if (window.confirm("Bạn có chắc muốn xóa bài luyện tập này?")) {
      const stored = localStorage.getItem("instructorExercises");
      if (stored) {
        const allExercises = JSON.parse(stored);
        const filtered = allExercises.filter((ex) => ex.id !== exerciseId);
        localStorage.setItem("instructorExercises", JSON.stringify(filtered));

        const userExercises = filtered.filter(
          (ex) => ex.instructorId === user?.id
        );
        setExercises(userExercises);
      }
    }
  };

  const handlePreview = (exercise) => {
    setPreviewExercise(exercise);
    setPreviewCode(exercise.starterCode[exercise.language] || "");
    setPreviewOutput("");
    setShowPreviewModal(true);
  };

  const runCode = () => {
    setIsRunning(true);
    setPreviewOutput("Đang chạy code...\n");

    // Simulate code execution
    setTimeout(() => {
      try {
        // Chỉ demo với test case public đầu tiên
        const publicTestCase = previewExercise.testCases.find(
          (tc) => tc.isPublic
        );

        if (publicTestCase) {
          setPreviewOutput(
            `✅ Test case công khai:\n` +
              `Input: ${publicTestCase.input}\n` +
              `Expected Output: ${publicTestCase.output}\n\n` +
              `⏱️ Thời gian: ${Math.random() * 100}ms\n` +
              `💾 Bộ nhớ: ${Math.random() * 50}MB\n\n` +
              `✅ Accepted`
          );
        } else {
          setPreviewOutput("Không có test case công khai để kiểm tra.");
        }
      } catch (error) {
        setPreviewOutput(`❌ Lỗi: ${error.message}`);
      }
      setIsRunning(false);
    }, 1500);
  };

  const togglePublish = (exerciseId) => {
    const stored = localStorage.getItem("instructorExercises");
    if (stored) {
      const allExercises = JSON.parse(stored);
      const updated = allExercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, isPublished: !ex.isPublished } : ex
      );
      localStorage.setItem("instructorExercises", JSON.stringify(updated));

      const userExercises = updated.filter(
        (ex) => ex.instructorId === user?.id
      );
      setExercises(userExercises);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "#4caf50",
      medium: "#ff9800",
      hard: "#f44336",
    };
    return colors[difficulty] || "#999";
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      easy: "Dễ",
      medium: "Trung bình",
      hard: "Khó",
    };
    return labels[difficulty] || difficulty;
  };

  const stats = {
    total: exercises.length,
    published: exercises.filter((ex) => ex.isPublished).length,
    draft: exercises.filter((ex) => !ex.isPublished).length,
    totalSubmissions: exercises.reduce(
      (sum, ex) => sum + (ex.totalSubmissions || 0),
      0
    ),
  };

  return (
    <div className="exercise-management">
      <div className="exercise-header">
        <div>
          <h1>Quản lý bài luyện tập</h1>
          <p>Tạo và quản lý các bài luyện tập lập trình cho học viên</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          ➕ Thêm bài luyện tập
        </button>
      </div>

      <div className="exercise-stats">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng bài tập</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.published}</div>
            <div className="stat-label">Đã xuất bản</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <div className="stat-value">{stats.draft}</div>
            <div className="stat-label">Bản nháp</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalSubmissions}</div>
            <div className="stat-label">Lượt nộp bài</div>
          </div>
        </div>
      </div>

      <div className="exercise-list">
        {exercises.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Chưa có bài luyện tập nào</h3>
            <p>Tạo bài luyện tập đầu tiên cho học viên của bạn</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              ➕ Tạo bài luyện tập
            </button>
          </div>
        ) : (
          <div className="exercise-grid">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-card">
                <div className="exercise-card-header">
                  <div className="exercise-title-row">
                    <h3>{exercise.title}</h3>
                    <span
                      className="difficulty-badge"
                      style={{
                        backgroundColor: getDifficultyColor(
                          exercise.difficulty
                        ),
                      }}
                    >
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                  </div>
                  <div className="exercise-meta">
                    <span className="language-tag">{exercise.language}</span>
                    {!exercise.isPublished && (
                      <span className="draft-badge">Bản nháp</span>
                    )}
                  </div>
                </div>

                <div className="exercise-card-body">
                  <p className="exercise-description">{exercise.description}</p>

                  <div className="exercise-limits">
                    <div className="limit-item">
                      <span className="limit-icon">⏱️</span>
                      <span>{exercise.timeLimit}ms</span>
                    </div>
                    <div className="limit-item">
                      <span className="limit-icon">💾</span>
                      <span>{exercise.memoryLimit}MB</span>
                    </div>
                    <div className="limit-item">
                      <span className="limit-icon">🧪</span>
                      <span>{exercise.testCases.length} test cases</span>
                    </div>
                  </div>

                  {exercise.tags && exercise.tags.length > 0 && (
                    <div className="exercise-tags">
                      {exercise.tags.map((tag, idx) => (
                        <span key={idx} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="exercise-stats-row">
                    <div className="stat-item">
                      <span>📊 {exercise.totalSubmissions || 0} lượt nộp</span>
                    </div>
                    <div className="stat-item">
                      <span>✅ {exercise.acceptanceRate || 0}% acceptance</span>
                    </div>
                  </div>
                </div>

                <div className="exercise-card-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => handlePreview(exercise)}
                  >
                    👁️ Preview
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleEdit(exercise)}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    className={`btn-toggle ${
                      exercise.isPublished ? "published" : ""
                    }`}
                    onClick={() => togglePublish(exercise.id)}
                  >
                    {exercise.isPublished ? "✅ Đã xuất bản" : "📤 Xuất bản"}
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(exercise.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal tạo/sửa bài tập */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {editingExercise
                  ? "Chỉnh sửa bài luyện tập"
                  : "Tạo bài luyện tập mới"}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="exercise-form">
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>

                <div className="form-group">
                  <label>Tiêu đề bài tập *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Tìm số lớn nhất trong mảng"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Mô tả yêu cầu bài toán..."
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Độ khó *</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ngôn ngữ chính *</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Giới hạn thời gian (ms) *</label>
                    <input
                      type="number"
                      name="timeLimit"
                      value={formData.timeLimit}
                      onChange={handleInputChange}
                      min="100"
                      step="100"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Giới hạn bộ nhớ (MB) *</label>
                    <input
                      type="number"
                      name="memoryLimit"
                      value={formData.memoryLimit}
                      onChange={handleInputChange}
                      min="64"
                      step="64"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={formData.tags.join(", ")}
                    onChange={handleTagsChange}
                    placeholder="array, sorting, dynamic-programming"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Định dạng Input/Output</h3>

                <div className="form-group">
                  <label>Định dạng Input</label>
                  <textarea
                    name="inputFormat"
                    value={formData.inputFormat}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Dòng đầu tiên chứa số nguyên n..."
                  />
                </div>

                <div className="form-group">
                  <label>Định dạng Output</label>
                  <textarea
                    name="outputFormat"
                    value={formData.outputFormat}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="In ra một số nguyên duy nhất..."
                  />
                </div>

                <div className="form-group">
                  <label>Ràng buộc</label>
                  <textarea
                    name="constraints"
                    value={formData.constraints}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="1 ≤ n ≤ 10^5"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Input mẫu</label>
                    <textarea
                      name="sampleInput"
                      value={formData.sampleInput}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="5&#10;1 2 3 4 5"
                    />
                  </div>

                  <div className="form-group">
                    <label>Output mẫu</label>
                    <textarea
                      name="sampleOutput"
                      value={formData.sampleOutput}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Starter Code (Template cho học viên)</h3>
                <div className="starter-code-tabs">
                  {Object.keys(formData.starterCode).map((lang) => (
                    <div key={lang} className="starter-code-group">
                      <label>{lang.toUpperCase()}</label>
                      <textarea
                        value={formData.starterCode[lang]}
                        onChange={(e) =>
                          handleStarterCodeChange(lang, e.target.value)
                        }
                        rows="6"
                        className="code-textarea"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Test Cases</h3>
                <p className="section-hint">
                  Thêm các test case để đánh giá code của học viên. Test case
                  công khai sẽ hiển thị cho học viên.
                </p>

                {formData.testCases.map((testCase, index) => (
                  <div key={index} className="test-case-item">
                    <div className="test-case-header">
                      <span>Test Case #{index + 1}</span>
                      <div className="test-case-controls">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={testCase.isPublic}
                            onChange={(e) =>
                              handleTestCaseChange(
                                index,
                                "isPublic",
                                e.target.checked
                              )
                            }
                          />
                          <span>Công khai</span>
                        </label>
                        {formData.testCases.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeTestCase(index)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Input</label>
                        <textarea
                          value={testCase.input}
                          onChange={(e) =>
                            handleTestCaseChange(index, "input", e.target.value)
                          }
                          rows="3"
                          placeholder="Input cho test case..."
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Expected Output</label>
                        <textarea
                          value={testCase.output}
                          onChange={(e) =>
                            handleTestCaseChange(
                              index,
                              "output",
                              e.target.value
                            )
                          }
                          rows="3"
                          placeholder="Output mong đợi..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-add-test"
                  onClick={addTestCase}
                >
                  ➕ Thêm test case
                </button>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                    />
                    <span>Xuất bản ngay sau khi lưu</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingExercise ? "Cập nhật" : "Tạo bài tập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewExercise && (
        <div
          className="modal-overlay"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="modal-content preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Preview: {previewExercise.title}</h2>
              <button
                className="close-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="preview-content">
              <div className="preview-problem">
                <h3>Đề bài</h3>
                <p>{previewExercise.description}</p>

                {previewExercise.inputFormat && (
                  <div className="preview-section">
                    <h4>Định dạng Input:</h4>
                    <pre>{previewExercise.inputFormat}</pre>
                  </div>
                )}

                {previewExercise.outputFormat && (
                  <div className="preview-section">
                    <h4>Định dạng Output:</h4>
                    <pre>{previewExercise.outputFormat}</pre>
                  </div>
                )}

                {previewExercise.constraints && (
                  <div className="preview-section">
                    <h4>Ràng buộc:</h4>
                    <pre>{previewExercise.constraints}</pre>
                  </div>
                )}

                {previewExercise.sampleInput && (
                  <div className="preview-section">
                    <h4>Input mẫu:</h4>
                    <pre>{previewExercise.sampleInput}</pre>
                  </div>
                )}

                {previewExercise.sampleOutput && (
                  <div className="preview-section">
                    <h4>Output mẫu:</h4>
                    <pre>{previewExercise.sampleOutput}</pre>
                  </div>
                )}
              </div>

              <div className="preview-editor">
                <div className="editor-header">
                  <h3>Code Editor</h3>
                  <span className="language-tag">
                    {previewExercise.language}
                  </span>
                </div>
                <textarea
                  className="code-editor"
                  value={previewCode}
                  onChange={(e) => setPreviewCode(e.target.value)}
                  placeholder="Viết code của bạn ở đây..."
                />
                <div className="editor-actions">
                  <button
                    className="btn-run"
                    onClick={runCode}
                    disabled={isRunning}
                  >
                    {isRunning ? "⏳ Đang chạy..." : "▶️ Chạy code"}
                  </button>
                </div>
                {previewOutput && (
                  <div className="preview-output">
                    <h4>Kết quả:</h4>
                    <pre>{previewOutput}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseManagement;
