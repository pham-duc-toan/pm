import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import coursesData from "../../data/courses.json";
import lessonsData from "../../data/lessons.json";
import "./LessonManagement.css";

const LessonManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Lấy khóa học
  const jsonCourse = coursesData.courses.find(
    (c) => c.id === parseInt(courseId)
  );
  const localCourses =
    JSON.parse(localStorage.getItem("instructorCourses")) || [];
  const localCourse = localCourses.find((c) => c.id === courseId);
  const course = jsonCourse || localCourse;

  // Lấy bài giảng từ JSON và localStorage
  const jsonLessons = lessonsData.lessons.filter(
    (l) => l.courseId === parseInt(courseId) || l.courseId === courseId
  );

  const [localLessons, setLocalLessons] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("instructorLessons")) || [];
    return stored.filter(
      (l) => l.courseId === courseId || l.courseId === parseInt(courseId)
    );
  });

  const allLessons = [
    ...jsonLessons.map((l) => ({ ...l, source: "json" })),
    ...localLessons.map((l) => ({ ...l, source: "local" })),
  ].sort((a, b) => a.order - b.order);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [isNewChapter, setIsNewChapter] = useState(true);
  const [existingChapters, setExistingChapters] = useState([]);
  const [lessonForm, setLessonForm] = useState({
    chapterNumber: 1,
    chapterTitle: "",
    lessonNumber: 1,
    title: "",
    type: "video",
    duration: "",
    videoUrl: "",
    content: "",
    isFree: false,
    exerciseId: null, // ID bài tập được nhúng
    // Exercise fields (khi không nhúng)
    exerciseData: {
      difficulty: "easy",
      language: "javascript",
      timeLimit: 1000,
      memoryLimit: 256,
      testCases: [
        { input: "", output: "", isPublic: true },
        { input: "", output: "", isPublic: false },
      ],
    },
    // Quiz fields
    quizData: {
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ],
      passingScore: 70,
      timeLimit: 30,
    },
  });

  // Load danh sách bài tập của giảng viên
  useEffect(() => {
    const stored = localStorage.getItem("instructorExercises");
    if (stored) {
      const allExercises = JSON.parse(stored);
      const userExercises = allExercises.filter(
        (ex) => ex.instructorId === user?.id && ex.isPublished
      );
      setAvailableExercises(userExercises);
      console.log("Loaded exercises:", userExercises); // Debug
    }
  }, [user]);

  // Load danh sách chương có sẵn
  useEffect(() => {
    const chapters = {};
    allLessons.forEach((lesson) => {
      const key = `${lesson.chapterNumber}`;
      if (!chapters[key]) {
        chapters[key] = {
          number: lesson.chapterNumber,
          title: lesson.chapterTitle,
        };
      }
    });
    setExistingChapters(
      Object.values(chapters).sort((a, b) => a.number - b.number)
    );
  }, [localLessons]);

  if (!course) {
    return (
      <div className="lesson-management-page">
        <div className="not-found">
          <h2>Không tìm thấy khóa học</h2>
          <button onClick={() => navigate("/instructor/courses")}>
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const handleCreateLesson = (e) => {
    e.preventDefault();

    const newLesson = {
      id: `lesson-${Date.now()}`,
      courseId: parseInt(courseId) || courseId,
      chapterNumber: parseInt(lessonForm.chapterNumber),
      chapterTitle: lessonForm.chapterTitle,
      lessonNumber: parseInt(lessonForm.lessonNumber),
      title: lessonForm.title,
      slug: lessonForm.title.toLowerCase().replace(/\s+/g, "-"),
      type: lessonForm.type,
      duration: lessonForm.type === "video" ? lessonForm.duration : null,
      videoUrl: lessonForm.type === "video" ? lessonForm.videoUrl : null,
      content: lessonForm.content,
      exerciseId: lessonForm.type === "exercise" ? lessonForm.exerciseId : null,
      exerciseData:
        lessonForm.type === "exercise" && !lessonForm.exerciseId
          ? lessonForm.exerciseData
          : null,
      quizData: lessonForm.type === "quiz" ? lessonForm.quizData : null,
      objectives: [],
      resources: [],
      isFree: lessonForm.isFree,
      order: allLessons.length + 1,
    };

    const allStoredLessons =
      JSON.parse(localStorage.getItem("instructorLessons")) || [];
    allStoredLessons.push(newLesson);
    localStorage.setItem("instructorLessons", JSON.stringify(allStoredLessons));

    setLocalLessons([...localLessons, newLesson]);
    setShowCreateModal(false);
    resetForm();
    alert("✅ Tạo bài giảng thành công!");
  };

  const handleEditClick = (lesson) => {
    setSelectedLesson(lesson);
    setLessonForm({
      chapterNumber: lesson.chapterNumber,
      chapterTitle: lesson.chapterTitle,
      lessonNumber: lesson.lessonNumber,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration || "",
      videoUrl: lesson.videoUrl || "",
      content: lesson.content,
      isFree: lesson.isFree,
    });
    setShowEditModal(true);
  };

  const handleUpdateLesson = (e) => {
    e.preventDefault();

    if (selectedLesson.source === "local") {
      const allStoredLessons =
        JSON.parse(localStorage.getItem("instructorLessons")) || [];
      const index = allStoredLessons.findIndex(
        (l) => l.id === selectedLesson.id
      );

      if (index !== -1) {
        allStoredLessons[index] = {
          ...allStoredLessons[index],
          chapterNumber: parseInt(lessonForm.chapterNumber),
          chapterTitle: lessonForm.chapterTitle,
          lessonNumber: parseInt(lessonForm.lessonNumber),
          title: lessonForm.title,
          type: lessonForm.type,
          duration: lessonForm.type === "video" ? lessonForm.duration : null,
          videoUrl: lessonForm.type === "video" ? lessonForm.videoUrl : null,
          content: lessonForm.content,
          isFree: lessonForm.isFree,
        };

        localStorage.setItem(
          "instructorLessons",
          JSON.stringify(allStoredLessons)
        );
        setLocalLessons(
          allStoredLessons.filter(
            (l) => l.courseId === courseId || l.courseId === parseInt(courseId)
          )
        );
        setShowEditModal(false);
        alert("✅ Cập nhật bài giảng thành công!");
      }
    } else {
      alert("⚠️ Không thể sửa bài giảng gốc từ hệ thống!");
    }
  };

  const handleDeleteLesson = (lesson) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài giảng "${lesson.title}"?`))
      return;

    if (lesson.source === "local") {
      const allStoredLessons =
        JSON.parse(localStorage.getItem("instructorLessons")) || [];
      const filtered = allStoredLessons.filter((l) => l.id !== lesson.id);
      localStorage.setItem("instructorLessons", JSON.stringify(filtered));
      setLocalLessons(
        filtered.filter(
          (l) => l.courseId === courseId || l.courseId === parseInt(courseId)
        )
      );
      alert("✅ Đã xóa bài giảng!");
    } else {
      alert("⚠️ Không thể xóa bài giảng gốc từ hệ thống!");
    }
  };

  const resetForm = () => {
    setLessonForm({
      chapterNumber: 1,
      chapterTitle: "",
      lessonNumber: 1,
      title: "",
      type: "video",
      duration: "",
      videoUrl: "",
      content: "",
      isFree: false,
      exerciseId: null,
      exerciseData: {
        difficulty: "easy",
        language: "javascript",
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: [
          { input: "", output: "", isPublic: true },
          { input: "", output: "", isPublic: false },
        ],
      },
      quizData: {
        questions: [
          {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
            explanation: "",
          },
        ],
        passingScore: 70,
        timeLimit: 30,
      },
    });
    setIsNewChapter(true);
    setSelectedLesson(null);
  };

  // Nhóm bài giảng theo chapter
  const lessonsByChapter = allLessons.reduce((acc, lesson) => {
    const key = `${lesson.chapterNumber}-${lesson.chapterTitle}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(lesson);
    return acc;
  }, {});

  return (
    <div className="lesson-management-page">
      <div className="page-header">
        <button
          className="btn-back"
          onClick={() => navigate("/instructor/courses")}
        >
          ← Quay lại
        </button>
        <div>
          <h1>{course.title}</h1>
          <p className="course-subtitle">Quản lý bài giảng</p>
        </div>
        <button
          className="btn-create-lesson"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Thêm bài giảng
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-icon">📚</span>
          <span className="stat-text">
            Tổng: <strong>{allLessons.length}</strong> bài
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎥</span>
          <span className="stat-text">
            Video:{" "}
            <strong>
              {allLessons.filter((l) => l.type === "video").length}
            </strong>
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">✏️</span>
          <span className="stat-text">
            Bài tập:{" "}
            <strong>
              {allLessons.filter((l) => l.type === "exercise").length}
            </strong>
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📝</span>
          <span className="stat-text">
            Quiz:{" "}
            <strong>
              {allLessons.filter((l) => l.type === "quiz").length}
            </strong>
          </span>
        </div>
      </div>

      {allLessons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>Chưa có bài giảng nào</h2>
          <p>Thêm bài giảng đầu tiên cho khóa học của bạn</p>
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Thêm bài giảng
          </button>
        </div>
      ) : (
        <div className="lessons-list">
          {Object.entries(lessonsByChapter).map(([key, lessons]) => (
            <div key={key} className="chapter-section">
              <div className="chapter-header">
                <h2>
                  Chương {lessons[0].chapterNumber}: {lessons[0].chapterTitle}
                </h2>
                <span className="chapter-count">{lessons.length} bài</span>
              </div>

              <div className="lessons-grid">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="lesson-card">
                    <div className="lesson-header">
                      <div
                        className="lesson-type-badge"
                        data-type={lesson.type}
                      >
                        {lesson.type === "video"
                          ? "🎥 Video"
                          : lesson.type === "exercise"
                          ? "✏️ Bài tập"
                          : lesson.type === "quiz"
                          ? "📝 Quiz"
                          : "📖 Đọc"}
                      </div>
                      {lesson.source === "local" && (
                        <span className="badge-custom">Tự tạo</span>
                      )}
                      {lesson.isFree && (
                        <span className="badge-free">Miễn phí</span>
                      )}
                    </div>

                    <h3 className="lesson-title">
                      Bài {lesson.lessonNumber}: {lesson.title}
                    </h3>

                    {lesson.duration && (
                      <p className="lesson-duration">⏱️ {lesson.duration}</p>
                    )}

                    {lesson.type === "exercise" && lesson.exerciseId && (
                      <div className="embedded-exercise-info">
                        <span className="exercise-badge">
                          🔗 Bài tập code đã nhúng
                        </span>
                        {availableExercises.find(
                          (ex) => ex.id === lesson.exerciseId
                        ) && (
                          <small
                            style={{
                              display: "block",
                              marginTop: "0.25rem",
                              color: "#666",
                            }}
                          >
                            {
                              availableExercises.find(
                                (ex) => ex.id === lesson.exerciseId
                              ).title
                            }
                          </small>
                        )}
                      </div>
                    )}

                    <p className="lesson-content">{lesson.content}</p>

                    <div className="lesson-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(lesson)}
                      >
                        ✏️ Sửa
                      </button>
                      {lesson.source === "local" && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteLesson(lesson)}
                        >
                          🗑️ Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Thêm bài giảng mới</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="modal-body">
              <h3 style={{ marginBottom: "1rem" }}>Thông tin chương</h3>

              <div
                className="chapter-selection"
                style={{ marginBottom: "2rem" }}
              >
                <div
                  className="radio-group"
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <label
                    className="radio-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="chapterType"
                      checked={!isNewChapter}
                      onChange={() => setIsNewChapter(false)}
                    />
                    <span>Thêm vào chương có sẵn</span>
                  </label>
                  <label
                    className="radio-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="chapterType"
                      checked={isNewChapter}
                      onChange={() => setIsNewChapter(true)}
                    />
                    <span>Tạo chương mới</span>
                  </label>
                </div>

                {!isNewChapter ? (
                  <div className="form-group">
                    <label htmlFor="existingChapter">Chọn chương *</label>
                    <select
                      id="existingChapter"
                      value={`${lessonForm.chapterNumber}|${lessonForm.chapterTitle}`}
                      onChange={(e) => {
                        const [num, title] = e.target.value.split("|");
                        setLessonForm({
                          ...lessonForm,
                          chapterNumber: num,
                          chapterTitle: title,
                        });
                      }}
                      required
                    >
                      <option value="">-- Chọn chương --</option>
                      {existingChapters.map((ch) => (
                        <option
                          key={ch.number}
                          value={`${ch.number}|${ch.title}`}
                        >
                          Chương {ch.number}: {ch.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="chapterNumber">Số chương *</label>
                      <input
                        type="number"
                        id="chapterNumber"
                        value={lessonForm.chapterNumber}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            chapterNumber: e.target.value,
                          })
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="chapterTitle">Tên chương *</label>
                      <input
                        type="text"
                        id="chapterTitle"
                        value={lessonForm.chapterTitle}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            chapterTitle: e.target.value,
                          })
                        }
                        placeholder="VD: Getting Started"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <h3 style={{ marginBottom: "1rem" }}>Thông tin bài giảng</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="lessonNumber">Số bài *</label>
                  <input
                    type="number"
                    id="lessonNumber"
                    value={lessonForm.lessonNumber}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        lessonNumber: e.target.value,
                      })
                    }
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Loại bài giảng *</label>
                  <select
                    id="type"
                    value={lessonForm.type}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, type: e.target.value })
                    }
                  >
                    <option value="video">🎥 Video</option>
                    <option value="exercise">✏️ Bài tập code</option>
                    <option value="quiz">📝 Quiz trắc nghiệm</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="title">Tiêu đề bài giảng *</label>
                <input
                  type="text"
                  id="title"
                  value={lessonForm.title}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, title: e.target.value })
                  }
                  placeholder="VD: Giới thiệu về React Hooks"
                  required
                />
              </div>

              {lessonForm.type === "video" && (
                <>
                  <div className="form-group">
                    <label htmlFor="duration">Thời lượng</label>
                    <input
                      type="text"
                      id="duration"
                      value={lessonForm.duration}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          duration: e.target.value,
                        })
                      }
                      placeholder="VD: 15:30"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="videoUrl">URL Video</label>
                    <input
                      type="url"
                      id="videoUrl"
                      value={lessonForm.videoUrl}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          videoUrl: e.target.value,
                        })
                      }
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </>
              )}

              {lessonForm.type === "exercise" && (
                <>
                  <div className="form-group">
                    <label htmlFor="exerciseId">
                      Nhúng bài tập code
                      <span
                        style={{
                          color: "#999",
                          fontSize: "0.9rem",
                          marginLeft: "0.5rem",
                        }}
                      >
                        ({availableExercises.length} bài tập có sẵn)
                      </span>
                    </label>
                    <select
                      id="exerciseId"
                      value={lessonForm.exerciseId || ""}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          exerciseId: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                    >
                      <option value="">
                        -- Không nhúng (Tạo bài tập độc lập) --
                      </option>
                      {availableExercises.length === 0 ? (
                        <option disabled>
                          ⚠️ Chưa có bài tập code đã xuất bản
                        </option>
                      ) : (
                        availableExercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            📝 {ex.title} •{" "}
                            {ex.difficulty === "easy"
                              ? "Dễ"
                              : ex.difficulty === "medium"
                              ? "TB"
                              : "Khó"}{" "}
                            • {ex.language.toUpperCase()}
                          </option>
                        ))
                      )}
                    </select>
                    <small
                      style={{
                        color: "#666",
                        marginTop: "0.5rem",
                        display: "block",
                        lineHeight: "1.5",
                      }}
                    >
                      {availableExercises.length === 0 ? (
                        <>
                          ⚠️ Bạn chưa có bài tập code nào. Vui lòng vào{" "}
                          <strong
                            style={{ color: "#667eea", cursor: "pointer" }}
                            onClick={() =>
                              (window.location.href = "/instructor/exercises")
                            }
                          >
                            Quản lý bài tập
                          </strong>{" "}
                          để tạo và xuất bản bài tập trước
                        </>
                      ) : lessonForm.exerciseId ? (
                        "✅ Bài tập code sẽ được nhúng trực tiếp vào bài học này"
                      ) : (
                        "💡 Chọn bài tập từ danh sách hoặc để trống để tạo bài tập độc lập"
                      )}
                    </small>
                  </div>

                  {!lessonForm.exerciseId && (
                    <div className="exercise-form-section">
                      <h4 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
                        Thông tin bài tập code
                      </h4>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Độ khó *</label>
                          <select
                            value={lessonForm.exerciseData.difficulty}
                            onChange={(e) =>
                              setLessonForm({
                                ...lessonForm,
                                exerciseData: {
                                  ...lessonForm.exerciseData,
                                  difficulty: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="easy">Dễ</option>
                            <option value="medium">Trung bình</option>
                            <option value="hard">Khó</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Ngôn ngữ *</label>
                          <select
                            value={lessonForm.exerciseData.language}
                            onChange={(e) =>
                              setLessonForm({
                                ...lessonForm,
                                exerciseData: {
                                  ...lessonForm.exerciseData,
                                  language: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Thời gian (ms) *</label>
                          <input
                            type="number"
                            value={lessonForm.exerciseData.timeLimit}
                            onChange={(e) =>
                              setLessonForm({
                                ...lessonForm,
                                exerciseData: {
                                  ...lessonForm.exerciseData,
                                  timeLimit: parseInt(e.target.value),
                                },
                              })
                            }
                            min="100"
                            step="100"
                          />
                        </div>

                        <div className="form-group">
                          <label>Bộ nhớ (MB) *</label>
                          <input
                            type="number"
                            value={lessonForm.exerciseData.memoryLimit}
                            onChange={(e) =>
                              setLessonForm({
                                ...lessonForm,
                                exerciseData: {
                                  ...lessonForm.exerciseData,
                                  memoryLimit: parseInt(e.target.value),
                                },
                              })
                            }
                            min="64"
                            step="64"
                          />
                        </div>
                      </div>

                      <h5 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
                        Test Cases
                      </h5>
                      {lessonForm.exerciseData.testCases.map((tc, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#f8f9fa",
                            padding: "1rem",
                            borderRadius: "8px",
                            marginBottom: "1rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <strong>Test Case #{idx + 1}</strong>
                            <label style={{ display: "flex", gap: "0.5rem" }}>
                              <input
                                type="checkbox"
                                checked={tc.isPublic}
                                onChange={(e) => {
                                  const newTestCases = [
                                    ...lessonForm.exerciseData.testCases,
                                  ];
                                  newTestCases[idx].isPublic = e.target.checked;
                                  setLessonForm({
                                    ...lessonForm,
                                    exerciseData: {
                                      ...lessonForm.exerciseData,
                                      testCases: newTestCases,
                                    },
                                  });
                                }}
                              />
                              <span>Công khai</span>
                            </label>
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Input</label>
                              <textarea
                                value={tc.input}
                                onChange={(e) => {
                                  const newTestCases = [
                                    ...lessonForm.exerciseData.testCases,
                                  ];
                                  newTestCases[idx].input = e.target.value;
                                  setLessonForm({
                                    ...lessonForm,
                                    exerciseData: {
                                      ...lessonForm.exerciseData,
                                      testCases: newTestCases,
                                    },
                                  });
                                }}
                                rows="2"
                              />
                            </div>
                            <div className="form-group">
                              <label>Output</label>
                              <textarea
                                value={tc.output}
                                onChange={(e) => {
                                  const newTestCases = [
                                    ...lessonForm.exerciseData.testCases,
                                  ];
                                  newTestCases[idx].output = e.target.value;
                                  setLessonForm({
                                    ...lessonForm,
                                    exerciseData: {
                                      ...lessonForm.exerciseData,
                                      testCases: newTestCases,
                                    },
                                  });
                                }}
                                rows="2"
                              />
                            </div>
                          </div>
                          {lessonForm.exerciseData.testCases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newTestCases =
                                  lessonForm.exerciseData.testCases.filter(
                                    (_, i) => i !== idx
                                  );
                                setLessonForm({
                                  ...lessonForm,
                                  exerciseData: {
                                    ...lessonForm.exerciseData,
                                    testCases: newTestCases,
                                  },
                                });
                              }}
                              style={{
                                background: "#ffebee",
                                color: "#c62828",
                                padding: "0.5rem 1rem",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                marginTop: "0.5rem",
                              }}
                            >
                              🗑️ Xóa test case
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setLessonForm({
                            ...lessonForm,
                            exerciseData: {
                              ...lessonForm.exerciseData,
                              testCases: [
                                ...lessonForm.exerciseData.testCases,
                                { input: "", output: "", isPublic: false },
                              ],
                            },
                          });
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          background: "#e3f2fd",
                          color: "#1976d2",
                          border: "2px dashed #1976d2",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        ➕ Thêm test case
                      </button>
                    </div>
                  )}
                </>
              )}

              {lessonForm.type === "quiz" && (
                <div className="quiz-form-section">
                  <h4 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
                    Câu hỏi trắc nghiệm
                  </h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Điểm đạt (%)</label>
                      <input
                        type="number"
                        value={lessonForm.quizData.passingScore}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            quizData: {
                              ...lessonForm.quizData,
                              passingScore: parseInt(e.target.value),
                            },
                          })
                        }
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="form-group">
                      <label>Thời gian (phút)</label>
                      <input
                        type="number"
                        value={lessonForm.quizData.timeLimit}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            quizData: {
                              ...lessonForm.quizData,
                              timeLimit: parseInt(e.target.value),
                            },
                          })
                        }
                        min="5"
                      />
                    </div>
                  </div>

                  {lessonForm.quizData.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      style={{
                        background: "#f8f9fa",
                        padding: "1rem",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <strong>Câu hỏi #{qIdx + 1}</strong>
                        {lessonForm.quizData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions =
                                lessonForm.quizData.questions.filter(
                                  (_, i) => i !== qIdx
                                );
                              setLessonForm({
                                ...lessonForm,
                                quizData: {
                                  ...lessonForm.quizData,
                                  questions: newQuestions,
                                },
                              });
                            }}
                            style={{
                              background: "#ffebee",
                              color: "#c62828",
                              padding: "0.25rem 0.75rem",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Câu hỏi *</label>
                        <textarea
                          value={q.question}
                          onChange={(e) => {
                            const newQuestions = [
                              ...lessonForm.quizData.questions,
                            ];
                            newQuestions[qIdx].question = e.target.value;
                            setLessonForm({
                              ...lessonForm,
                              quizData: {
                                ...lessonForm.quizData,
                                questions: newQuestions,
                              },
                            });
                          }}
                          rows="2"
                          required
                        />
                      </div>

                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="form-group"
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctAnswer === oIdx}
                            onChange={() => {
                              const newQuestions = [
                                ...lessonForm.quizData.questions,
                              ];
                              newQuestions[qIdx].correctAnswer = oIdx;
                              setLessonForm({
                                ...lessonForm,
                                quizData: {
                                  ...lessonForm.quizData,
                                  questions: newQuestions,
                                },
                              });
                            }}
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newQuestions = [
                                ...lessonForm.quizData.questions,
                              ];
                              newQuestions[qIdx].options[oIdx] = e.target.value;
                              setLessonForm({
                                ...lessonForm,
                                quizData: {
                                  ...lessonForm.quizData,
                                  questions: newQuestions,
                                },
                              });
                            }}
                            placeholder={`Đáp án ${String.fromCharCode(
                              65 + oIdx
                            )}`}
                            style={{ flex: 1 }}
                            required
                          />
                        </div>
                      ))}

                      <div className="form-group">
                        <label>Giải thích (tùy chọn)</label>
                        <textarea
                          value={q.explanation}
                          onChange={(e) => {
                            const newQuestions = [
                              ...lessonForm.quizData.questions,
                            ];
                            newQuestions[qIdx].explanation = e.target.value;
                            setLessonForm({
                              ...lessonForm,
                              quizData: {
                                ...lessonForm.quizData,
                                questions: newQuestions,
                              },
                            });
                          }}
                          rows="2"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setLessonForm({
                        ...lessonForm,
                        quizData: {
                          ...lessonForm.quizData,
                          questions: [
                            ...lessonForm.quizData.questions,
                            {
                              question: "",
                              options: ["", "", "", ""],
                              correctAnswer: 0,
                              explanation: "",
                            },
                          ],
                        },
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "#e3f2fd",
                      color: "#1976d2",
                      border: "2px dashed #1976d2",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    ➕ Thêm câu hỏi
                  </button>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="content">Nội dung *</label>
                <textarea
                  id="content"
                  value={lessonForm.content}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, content: e.target.value })
                  }
                  rows="5"
                  placeholder="Mô tả chi tiết về bài giảng..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  ✅ Thêm bài giảng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Sửa bài giảng</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateLesson} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-chapterNumber">Số chương *</label>
                  <input
                    type="number"
                    id="edit-chapterNumber"
                    value={lessonForm.chapterNumber}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        chapterNumber: e.target.value,
                      })
                    }
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-chapterTitle">Tên chương *</label>
                  <input
                    type="text"
                    id="edit-chapterTitle"
                    value={lessonForm.chapterTitle}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        chapterTitle: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-lessonNumber">Số bài *</label>
                  <input
                    type="number"
                    id="edit-lessonNumber"
                    value={lessonForm.lessonNumber}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        lessonNumber: e.target.value,
                      })
                    }
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-type">Loại bài giảng *</label>
                  <select
                    id="edit-type"
                    value={lessonForm.type}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, type: e.target.value })
                    }
                  >
                    <option value="video">Video</option>
                    <option value="exercise">Bài tập</option>
                    <option value="quiz">Quiz</option>
                    <option value="reading">Đọc</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-title">Tiêu đề *</label>
                <input
                  type="text"
                  id="edit-title"
                  value={lessonForm.title}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, title: e.target.value })
                  }
                  required
                />
              </div>

              {lessonForm.type === "video" && (
                <>
                  <div className="form-group">
                    <label htmlFor="edit-duration">Thời lượng</label>
                    <input
                      type="text"
                      id="edit-duration"
                      value={lessonForm.duration}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-videoUrl">URL Video</label>
                    <input
                      type="url"
                      id="edit-videoUrl"
                      value={lessonForm.videoUrl}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          videoUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="edit-content">Nội dung *</label>
                <textarea
                  id="edit-content"
                  value={lessonForm.content}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, content: e.target.value })
                  }
                  rows="5"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  ✅ Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonManagement;
