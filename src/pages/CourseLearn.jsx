import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import fakeDatabase from "../data/fakeDatabase.json";
import courseDetailsData from "../data/courseDetails.json";
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

  const course = fakeDatabase.courses.find((c) => c.id === parseInt(id));
  const courseDetails = courseDetailsData[id] || {};
  const { curriculum = [] } = courseDetails;

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
    const lessonId = `${currentModuleIndex}-${currentLessonIndex}`;

    if (!completedLessons.includes(lessonId)) {
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
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < curriculum.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    } else {
      alert("🎉 Chúc mừng! Bạn đã hoàn thành khóa học!");
    }

    // Save progress
    dispatch(
      updateProgress({
        enrollmentId: enrollment.id,
        moduleIndex: currentModuleIndex,
        lessonIndex: currentLessonIndex + 1,
      })
    );
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = curriculum[currentModuleIndex - 1];
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(prevModule.lessons.length - 1);
    }
  };

  const goToLesson = (moduleIndex, lessonIndex) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
  };

  const isLessonCompleted = (moduleIndex, lessonIndex) => {
    const lessonId = `${moduleIndex}-${lessonIndex}`;
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
    const isPassed = percentage >= 70;

    setShowQuizResult({
      score,
      totalQuestions,
      percentage,
      isPassed,
      correctAnswers,
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
                {!isPlaying && videoProgress === 0 && (
                  <div className="video-thumbnail">
                    <img src={course.thumbnail} alt={currentLesson.title} />
                    <button
                      className="play-overlay"
                      onClick={() => setIsPlaying(true)}
                    >
                      <span className="play-icon">▶</span>
                    </button>
                  </div>
                )}
                {(isPlaying || videoProgress > 0) && (
                  <div className="video-playing">
                    <div className="video-screen">
                      <img
                        src={course.thumbnail}
                        alt={currentLesson.title}
                        style={{ opacity: 0.7 }}
                      />
                      <div className="video-overlay">
                        <button
                          className="play-pause-btn"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? "⏸" : "▶"}
                        </button>
                        <div className="video-time">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="video-controls">
                <div className="progress-bar-video">
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
                    {isPlaying ? "⏸ Tạm dừng" : "▶ Phát"}
                  </button>
                  <div className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  <button
                    className="control-btn"
                    onClick={() =>
                      setCurrentTime(Math.min(currentTime + 10, duration))
                    }
                  >
                    +10s
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Document Content */}
          {currentLesson?.type === "document" && (
            <div className="document-container">
              <div className="document-icon">📄</div>
              <h2>Tài liệu: {currentLesson.title}</h2>
              <p>Đây là tài liệu học tập cho bài học này.</p>
              <div className="document-content">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p>
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
              <button className="btn-complete" onClick={handleLessonComplete}>
                ✓ Đánh dấu hoàn thành
              </button>
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
                      ? "Chúc mừng! Bạn đã vượt qua bài kiểm tra"
                      : "Bạn chưa đạt yêu cầu"}
                  </h2>
                  <div className="score-display">
                    <div className="score-circle">
                      <div className="score-number">
                        {showQuizResult.percentage.toFixed(0)}%
                      </div>
                      <div className="score-text">
                        {showQuizResult.score}/{showQuizResult.totalQuestions}{" "}
                        câu đúng
                      </div>
                    </div>
                  </div>
                  <p className="result-message">
                    {showQuizResult.isPassed
                      ? "Bạn đã trả lời đúng đủ số câu hỏi để hoàn thành bài kiểm tra!"
                      : `Bạn cần đạt ít nhất 70% để vượt qua. Hãy thử lại!`}
                  </p>

                  <div className="quiz-result-actions">
                    {!showQuizResult.isPassed && (
                      <button className="btn-retry" onClick={handleRetryQuiz}>
                        🔄 Làm lại
                      </button>
                    )}
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

          {/* Navigation Buttons */}
          <div className="lesson-navigation">
            <button
              className="nav-btn prev"
              onClick={handlePreviousLesson}
              disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
            >
              ← Bài trước
            </button>
            <button className="nav-btn next" onClick={handleNextLesson}>
              Bài tiếp →
            </button>
          </div>
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
                      const isCompleted = isLessonCompleted(
                        moduleIndex,
                        lessonIndex
                      );

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
