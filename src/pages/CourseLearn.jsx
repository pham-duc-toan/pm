import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import fakeDatabase from "../data/fakeDatabase.json";
import coursesData from "../data/courses.json";
import lessonsData from "../data/lessons.json";
import exercisesData from "../data/exercises.json";
import commentsData from "../data/comments.json";
import CodeEditor from "../components/CodeEditor";
import {
  updateProgress,
  completeLesson,
  updateCourseProgress,
} from "../store/enrollmentSlice";
import "./CourseLearn.css";

const CourseLearn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.enrollment);

  // Lấy thông tin course từ JSON mới
  const course = coursesData.courses.find((c) => c.id === parseInt(id));
  const courseInfo = course;
  const courseLessons = lessonsData.lessons.filter(
    (l) => l.courseId === parseInt(id)
  );
  const courseExercises = exercisesData.exercises.filter(
    (e) => e.courseId === parseInt(id)
  );

  // Group lessons theo chapter để tạo curriculum
  const curriculumObj = courseLessons.reduce((acc, lesson) => {
    const chapterKey = `chapter-${lesson.chapterNumber}`;
    if (!acc[chapterKey]) {
      acc[chapterKey] = {
        id: chapterKey,
        title: lesson.chapterTitle,
        lessons: [],
      };
    }
    acc[chapterKey].lessons.push({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
      objectives: lesson.objectives,
      resources: lesson.resources,
      isFree: lesson.isFree,
    });
    return acc;
  }, {});

  const curriculum = Object.values(curriculumObj);

  const courseDetails = {
    ...courseInfo,
    curriculum: curriculum,
  };

  // Check if user is enrolled
  const enrollment = enrolledCourses.find(
    (e) => e.courseId === parseInt(id) && e.userId === user?.id
  );

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!enrollment) {
      alert("Bạn chưa đăng ký khóa học này!");
      navigate(`/course/${id}`);
      return;
    }

    if (!course || curriculum.length === 0) {
      navigate("/");
      return;
    }

    // Load saved progress
    if (
      enrollment.currentModule !== undefined &&
      enrollment.currentLesson !== undefined
    ) {
      setCurrentModuleIndex(enrollment.currentModule);
      setCurrentLessonIndex(enrollment.currentLesson);
    }
  }, [user, enrollment, course, curriculum, id, navigate]);

  useEffect(() => {
    if (currentLesson?.type === "video") {
      // Simulate video duration (random between 5-15 minutes)
      const randomDuration = Math.floor(Math.random() * 600) + 300; // 5-15 minutes in seconds
      setDuration(randomDuration);
      setCurrentTime(0);
      setVideoProgress(0);
      setIsPlaying(false);
    }
  }, [currentModuleIndex, currentLessonIndex]);

  // Auto-play simulation
  useEffect(() => {
    let interval;
    if (isPlaying && currentLesson?.type === "video") {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            handleLessonComplete();
            return duration;
          }
          const newTime = prev + 1;
          setVideoProgress((newTime / duration) * 100);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  if (!course || curriculum.length === 0 || !enrollment) {
    return null;
  }

  const currentModule = curriculum[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  // Lấy exercise data nếu lesson type là "exercise"
  const currentExercise =
    currentLesson?.type === "exercise"
      ? courseExercises.find((ex) => ex.lessonId === currentLesson.id)
      : null;

  // Lấy comments cho lesson hiện tại
  const lessonComments = commentsData.comments.filter(
    (c) =>
      (c.type === "lesson" && c.targetId === currentLesson?.id) ||
      (c.type === "exercise" &&
        currentExercise &&
        c.targetId === currentExercise.id)
  );

  const totalLessons = curriculum.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );
  const completedLessons = enrollment.completedLessons || [];
  const progressPercentage = Math.round(
    (completedLessons.length / totalLessons) * 100
  );

  // Update course progress when completed lessons change
  useEffect(() => {
    if (enrollment && totalLessons > 0) {
      const newProgress = Math.round(
        (completedLessons.length / totalLessons) * 100
      );
      if (enrollment.progress !== newProgress) {
        dispatch(
          updateCourseProgress({
            enrollmentId: enrollment.id,
            progress: newProgress,
          })
        );
      }
    }
  }, [completedLessons.length, totalLessons, enrollment, dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLessonComplete = () => {
    const lessonId = currentLesson?.id;

    if (lessonId && !completedLessons.includes(lessonId)) {
      dispatch(
        completeLesson({
          enrollmentId: enrollment.id,
          lessonId,
          moduleIndex: currentModuleIndex,
          lessonIndex: currentLessonIndex,
        })
      );
    }
  };

  const handleNextLesson = () => {
    // Đánh dấu bài hiện tại là hoàn thành trước khi chuyển
    const currentLessonId = currentLesson?.id;
    if (currentLessonId && !completedLessons.includes(currentLessonId)) {
      dispatch(
        completeLesson({
          enrollmentId: enrollment.id,
          lessonId: currentLessonId,
        })
      );
    }

    let newModuleIndex = currentModuleIndex;
    let newLessonIndex = currentLessonIndex;

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      newLessonIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(newLessonIndex);
    } else if (currentModuleIndex < curriculum.length - 1) {
      newModuleIndex = currentModuleIndex + 1;
      newLessonIndex = 0;
      setCurrentModuleIndex(newModuleIndex);
      setCurrentLessonIndex(newLessonIndex);
    } else {
      alert("🎉 Chúc mừng! Bạn đã hoàn thành khóa học!");
      return;
    }

    // Lưu vị trí học mới
    dispatch(
      updateProgress({
        enrollmentId: enrollment.id,
        moduleIndex: newModuleIndex,
        lessonIndex: newLessonIndex,
      })
    );

    // Reset video state
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoProgress(0);
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  const handlePreviousLesson = () => {
    let newModuleIndex = currentModuleIndex;
    let newLessonIndex = currentLessonIndex;

    if (currentLessonIndex > 0) {
      newLessonIndex = currentLessonIndex - 1;
      setCurrentLessonIndex(newLessonIndex);
    } else if (currentModuleIndex > 0) {
      const prevModule = curriculum[currentModuleIndex - 1];
      newModuleIndex = currentModuleIndex - 1;
      newLessonIndex = prevModule.lessons.length - 1;
      setCurrentModuleIndex(newModuleIndex);
      setCurrentLessonIndex(newLessonIndex);
    }

    // Lưu vị trí học mới
    dispatch(
      updateProgress({
        enrollmentId: enrollment.id,
        moduleIndex: newModuleIndex,
        lessonIndex: newLessonIndex,
      })
    );

    // Reset video state
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoProgress(0);
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  const goToLesson = (moduleIndex, lessonIndex) => {
    // Đánh dấu bài hiện tại là hoàn thành trước khi chuyển
    const currentLessonId = currentLesson?.id;
    if (
      currentLessonId &&
      !completedLessons.includes(currentLessonId) &&
      currentLesson?.type === "video" &&
      videoProgress >= 90
    ) {
      dispatch(
        completeLesson({
          enrollmentId: enrollment.id,
          lessonId: currentLessonId,
        })
      );
    }

    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);

    // Lưu vị trí học mới
    dispatch(
      updateProgress({
        enrollmentId: enrollment.id,
        moduleIndex: moduleIndex,
        lessonIndex: lessonIndex,
      })
    );

    // Reset video state
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoProgress(0);
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  const handleQuizSubmit = () => {
    const correctAnswers = {
      q1: "b",
      q2: "a",
      q3: "c",
    };

    let score = 0;
    Object.keys(correctAnswers).forEach((key) => {
      if (quizAnswers[key] === correctAnswers[key]) {
        score++;
      }
    });

    const percentage = (score / Object.keys(correctAnswers).length) * 100;
    const totalQuestions = Object.keys(correctAnswers).length;
    const isPassed = percentage === 100; // Phải đúng hết 100%

    setShowQuizResult({
      score,
      totalQuestions,
      percentage,
      isPassed,
    });

    if (isPassed) {
      handleLessonComplete();
    }
  };

  const handleRetryQuiz = () => {
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  return (
    <div className="course-learn-page">
      {/* Header */}
      <div className="learn-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/my-courses")}>
            ← Khóa học của tôi
          </button>
          <h2 className="course-title-header">{course.title}</h2>
        </div>
        <div className="header-right">
          <div className="progress-info">
            <span>Tiến độ: {progressPercentage}%</span>
            <div className="progress-bar-small">
              <div
                className="progress-fill-small"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <button
            className="toggle-sidebar-btn"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? "◀ Ẩn" : "▶ Hiện"}
          </button>
        </div>
      </div>

      <div className="learn-container">
        {/* Main Content */}
        <div className="learn-content">
          <div className="lesson-header">
            <div className="lesson-info">
              <span className="module-name">{currentModule.title}</span>
              <h1 className="lesson-title">
                {currentLesson?.title || "Bài học"}
              </h1>
            </div>
          </div>

          {/* Video Player */}
          {currentLesson?.type === "video" && (
            <div className="video-container">
              <div className="video-player">
                <div className="video-demo">
                  <img
                    src={course.thumbnail}
                    alt={currentLesson.title}
                    className="video-thumbnail-img"
                  />
                  {!isPlaying && videoProgress === 0 && (
                    <div
                      className="play-overlay"
                      onClick={() => setIsPlaying(true)}
                    >
                      <div className="play-button">▶</div>
                    </div>
                  )}
                  {(isPlaying || videoProgress > 0) && (
                    <div className="video-overlay">
                      <div className="video-status">
                        {isPlaying ? "⏸ Đang phát..." : "⏸ Tạm dừng"}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`video-controls ${
                    !isPlaying && videoProgress === 0 ? "hidden" : ""
                  }`}
                >
                  <div
                    className="progress-bar-video"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = (clickX / rect.width) * 100;
                      const newTime = (percentage / 100) * duration;
                      setCurrentTime(newTime);
                      setVideoProgress(percentage);
                    }}
                  >
                    <div
                      className="progress-fill-video"
                      style={{ width: `${videoProgress}%` }}
                    ></div>
                  </div>
                  <div className="controls-bottom">
                    <button
                      className="control-btn"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? "⏸" : "▶"}
                    </button>
                    <button
                      className="control-btn"
                      onClick={() => {
                        const newTime = Math.max(currentTime - 10, 0);
                        setCurrentTime(newTime);
                        setVideoProgress((newTime / duration) * 100);
                      }}
                    >
                      -10s
                    </button>
                    <button
                      className="control-btn"
                      onClick={() => {
                        const newTime = Math.min(currentTime + 10, duration);
                        setCurrentTime(newTime);
                        setVideoProgress((newTime / duration) * 100);
                      }}
                    >
                      +10s
                    </button>
                    <div className="time-display">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>
              </div>
              {/* Navigation Buttons */}
              <div className="lesson-navigation">
                <button
                  className="nav-btn prev"
                  onClick={handlePreviousLesson}
                  disabled={
                    currentModuleIndex === 0 && currentLessonIndex === 0
                  }
                >
                  ← Bài trước
                </button>
                <button className="nav-btn next" onClick={handleNextLesson}>
                  Bài tiếp →
                </button>
              </div>

              <div className="video-info">
                <h3>{currentLesson.title}</h3>
                <p>{currentLesson.content}</p>
                {currentLesson.objectives &&
                  currentLesson.objectives.length > 0 && (
                    <div className="lesson-objectives">
                      <h4>🎯 Mục tiêu bài học:</h4>
                      <ul>
                        {currentLesson.objectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {currentLesson.resources &&
                  currentLesson.resources.length > 0 && (
                    <div className="lesson-resources">
                      <h4>📚 Tài nguyên tham khảo:</h4>
                      <ul>
                        {currentLesson.resources.map((res, idx) => (
                          <li key={idx}>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {res.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Quiz Content */}
          {currentLesson?.type === "quiz" && (
            <div className="quiz-container">
              {!showQuizResult ? (
                <>
                  <div className="quiz-header">
                    <div className="quiz-icon">📝</div>
                    <h2>{currentLesson.title}</h2>
                    <p>Hoàn thành bài kiểm tra để tiếp tục</p>
                  </div>

                  <div className="quiz-questions">
                    <div className="question-item">
                      <h3>Câu 1: React là gì?</h3>
                      <label>
                        <input
                          type="radio"
                          name="q1"
                          value="a"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q1: e.target.value,
                            })
                          }
                        />
                        A. Một ngôn ngữ lập trình
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q1"
                          value="b"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q1: e.target.value,
                            })
                          }
                        />
                        B. Một thư viện JavaScript
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q1"
                          value="c"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q1: e.target.value,
                            })
                          }
                        />
                        C. Một hệ điều hành
                      </label>
                    </div>

                    <div className="question-item">
                      <h3>Câu 2: JSX là viết tắt của?</h3>
                      <label>
                        <input
                          type="radio"
                          name="q2"
                          value="a"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q2: e.target.value,
                            })
                          }
                        />
                        A. JavaScript XML
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q2"
                          value="b"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q2: e.target.value,
                            })
                          }
                        />
                        B. Java Syntax Extension
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q2"
                          value="c"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q2: e.target.value,
                            })
                          }
                        />
                        C. JavaScript Extension
                      </label>
                    </div>

                    <div className="question-item">
                      <h3>Câu 3: Hook nào dùng để quản lý state?</h3>
                      <label>
                        <input
                          type="radio"
                          name="q3"
                          value="a"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q3: e.target.value,
                            })
                          }
                        />
                        A. useEffect
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q3"
                          value="b"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q3: e.target.value,
                            })
                          }
                        />
                        B. useContext
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="q3"
                          value="c"
                          onChange={(e) =>
                            setQuizAnswers({
                              ...quizAnswers,
                              q3: e.target.value,
                            })
                          }
                        />
                        C. useState
                      </label>
                    </div>
                  </div>

                  <button
                    className="btn-submit-quiz"
                    onClick={handleQuizSubmit}
                  >
                    Nộp bài
                  </button>
                </>
              ) : (
                /* Quiz Result */
                <div className="quiz-result">
                  <div
                    className={`result-icon ${
                      showQuizResult.isPassed ? "success" : "failed"
                    }`}
                  >
                    {showQuizResult.isPassed ? "🎉" : "😔"}
                  </div>
                  <h2>
                    {showQuizResult.isPassed
                      ? "Chúc mừng! Bạn đã hoàn thành bài kiểm tra"
                      : "Chưa đạt yêu cầu"}
                  </h2>
                  <div className="score-display">
                    <div className="score-circle">
                      <div className="score-number">
                        {showQuizResult.score}/{showQuizResult.totalQuestions}
                      </div>
                      <div className="score-text">Điểm số</div>
                    </div>
                  </div>
                  <p className="result-message">
                    {showQuizResult.isPassed
                      ? "Xuất sắc! Bạn đã trả lời đúng tất cả các câu hỏi!"
                      : `Bạn cần trả lời đúng tất cả các câu hỏi để hoàn thành. Hãy thử lại!`}
                  </p>

                  <div className="quiz-result-actions">
                    <button className="btn-retry" onClick={handleRetryQuiz}>
                      🔄 Làm lại
                    </button>
                    {showQuizResult.isPassed && (
                      <button
                        className="btn-next-quiz"
                        onClick={handleNextLesson}
                      >
                        Bài tiếp →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coding Exercise */}
          {currentLesson?.type === "exercise" && currentExercise && (
            <div className="coding-exercise-container">
              <div className="exercise-header">
                <h2>💻 {currentExercise.title}</h2>
                <p className="exercise-description">
                  {currentExercise.description}
                </p>
                {currentExercise.difficulty && (
                  <span
                    className={`difficulty-badge ${currentExercise.difficulty}`}
                  >
                    {currentExercise.difficulty === "easy"
                      ? "🟢 Dễ"
                      : currentExercise.difficulty === "medium"
                      ? "🟡 Trung bình"
                      : "🔴 Khó"}
                  </span>
                )}
                <div className="exercise-meta">
                  <span>⭐ {currentExercise.points} điểm</span>
                  {currentExercise.timeLimit && (
                    <span>⏱️ {currentExercise.timeLimit} phút</span>
                  )}
                </div>
              </div>

              <CodeEditor
                language={currentExercise.language || "javascript"}
                initialCode={currentExercise.initialCode || ""}
                testCases={currentExercise.testCases || []}
                submitButtonText="Nộp bài"
                onSubmit={(result) => {
                  // Tự động hoàn thành bài tập khi nộp bài
                  handleLessonComplete();
                  if (result.passed) {
                    alert("🎉 Chúc mừng! Bạn đã hoàn thành bài tập!");
                  } else {
                    alert("⚠️ Bài làm chưa đạt. Hãy thử lại!");
                  }
                }}
              />

              {currentExercise.hints && currentExercise.hints.length > 0 && (
                <div className="exercise-hints">
                  <h4>💡 Gợi ý:</h4>
                  <ul>
                    {currentExercise.hints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Nếu lesson type là exercise nhưng chưa có data */}
          {currentLesson?.type === "exercise" && !currentExercise && (
            <div className="coding-exercise-container">
              <div className="exercise-placeholder">
                <p>⚠️ Bài tập đang được cập nhật...</p>
              </div>
            </div>
          )}

          {/* Comments Section */}
          {lessonComments.length > 0 && (
            <div className="lesson-comments">
              <h3>💬 Thảo luận ({lessonComments.length})</h3>
              <div className="comments-list">
                {lessonComments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="comment-avatar"
                      />
                      <div className="comment-meta">
                        <strong>{comment.userName}</strong>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      {comment.rating && (
                        <div className="comment-rating">
                          {"⭐".repeat(comment.rating)}
                        </div>
                      )}
                    </div>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                      <button className="comment-like">
                        👍 {comment.likes || 0}
                      </button>
                      {comment.replies && comment.replies.length > 0 && (
                        <span className="comment-replies">
                          💬 {comment.replies.length} phản hồi
                        </span>
                      )}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="comment-replies-list">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="comment-reply">
                            <img
                              src={reply.userAvatar}
                              alt={reply.userName}
                              className="reply-avatar"
                            />
                            <div className="reply-content">
                              <strong>{reply.userName}</strong>
                              <span className="reply-date">
                                {new Date(reply.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                              <p>{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Curriculum */}
        {showSidebar && (
          <div className="learn-sidebar">
            <div className="sidebar-header">
              <h3>Nội dung khóa học</h3>
              <div className="sidebar-progress">
                {completedLessons.length}/{totalLessons} bài học
              </div>
            </div>

            <div className="curriculum-sidebar">
              {curriculum.map((module, moduleIndex) => (
                <div key={moduleIndex} className="module-sidebar">
                  <div className="module-header-sidebar">
                    <span className="module-number">{moduleIndex + 1}</span>
                    <span className="module-title-sidebar">{module.title}</span>
                  </div>
                  <div className="lessons-sidebar">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isActive =
                        moduleIndex === currentModuleIndex &&
                        lessonIndex === currentLessonIndex;
                      const isCompleted = isLessonCompleted(lesson.id);

                      return (
                        <div
                          key={lessonIndex}
                          className={`lesson-sidebar ${
                            isActive ? "active" : ""
                          } ${isCompleted ? "completed" : ""}`}
                          onClick={() => goToLesson(moduleIndex, lessonIndex)}
                        >
                          <span className="lesson-icon">
                            {isCompleted
                              ? "✓"
                              : lesson.type === "video"
                              ? "▶"
                              : lesson.type === "exercise"
                              ? "💻"
                              : lesson.type === "quiz"
                              ? "📝"
                              : "📄"}
                          </span>
                          <span className="lesson-title-sidebar">
                            {lesson.title}
                          </span>
                          {lesson.duration && (
                            <span className="lesson-duration-sidebar">
                              {lesson.duration}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLearn;
